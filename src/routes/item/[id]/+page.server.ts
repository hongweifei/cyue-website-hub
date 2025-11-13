export const prerender = true;

import { error } from "@sveltejs/kit";
import { loadAllNavItems } from "$lib/dataLoader";
import type { ItemRecommendation, NavItem } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ params }) => {
  const allItems = loadAllNavItems();
  const tagFrequency = buildTagFrequency(allItems);
  const item = allItems.find((i) => i.id === params.id);

  if (!item) {
    throw error(404, "导航项不存在");
  }

  return {
    item,
    recommendations: generateRecommendations(allItems, tagFrequency, item, 6),
  };
};

export async function entries() {
  const allItems = loadAllNavItems();
  return allItems.map((item) => ({
    id: item.id,
  }));
}

function generateRecommendations(
  allItems: NavItem[],
  tagFrequency: Map<string, number>,
  currentItem: NavItem,
  maxItems: number,
): ItemRecommendation[] {
  const limit = Math.max(0, maxItems);
  const totalItems = allItems.length || 1;
  const itemTagsSet = new Set(currentItem.tags);

  return allItems
    .filter((candidate) => candidate.id !== currentItem.id)
    .map((candidate) => {
      const commonTags = candidate.tags.filter((tag) => itemTagsSet.has(tag));
      const isSameGroup = candidate.group === currentItem.group;

      const rareTagScore = commonTags.reduce((score, tag) => {
        const frequency = tagFrequency.get(tag) ?? 1;
        return score + Math.log1p(totalItems / frequency);
      }, 0);

      const overlapWithCurrent =
        currentItem.tags.length > 0
          ? commonTags.length / currentItem.tags.length
          : 0;

      const overlapWithCandidate =
        candidate.tags.length > 0
          ? commonTags.length / candidate.tags.length
          : 0;

      const combinedCoverage = overlapWithCurrent + overlapWithCandidate;

      const diversityPenalty =
        candidate.tags.length > 0
          ? Math.max(0, candidate.tags.length - commonTags.length) * 0.05
          : 0;

      const score =
        rareTagScore * 8 +
        commonTags.length * 5 +
        combinedCoverage * 6 +
        (isSameGroup ? 4 : 0) -
        diversityPenalty;

      return {
        item: candidate,
        commonTags,
        isSameGroup,
        score,
        overlapWithCurrent,
        overlapWithCandidate,
      };
    })
    .filter(({ commonTags, isSameGroup }) => commonTags.length > 0 || isSameGroup)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.commonTags.length !== a.commonTags.length) {
        return b.commonTags.length - a.commonTags.length;
      }
      if (b.overlapWithCurrent !== a.overlapWithCurrent) {
        return b.overlapWithCurrent - a.overlapWithCurrent;
      }
      if (a.isSameGroup !== b.isSameGroup) {
        return Number(b.isSameGroup) - Number(a.isSameGroup);
      }
      return a.item.name.localeCompare(b.item.name, "zh-CN");
    })
    .slice(0, limit)
    .map(({ item, commonTags, isSameGroup }) => ({
      item,
      commonTags,
      isSameGroup,
    }));
}

function buildTagFrequency(allItems: NavItem[]): Map<string, number> {
  const frequency = new Map<string, number>();
  allItems.forEach((item) => {
    item.tags.forEach((tag) => {
      frequency.set(tag, (frequency.get(tag) ?? 0) + 1);
    });
  });
  return frequency;
}
