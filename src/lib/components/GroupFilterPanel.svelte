<script lang="ts">
  import { browser } from "$app/environment";
  import { layout, type LayoutMode } from "$lib/stores/layout";
  import { countGroupItems } from "$lib/utils/group";
  import type { NavGroup } from "$lib/types";
  import { get } from "svelte/store";

  type PanelVariant = LayoutMode;

  interface Props {
    groups: NavGroup[];
    selectedGroupId: string | null;
    onSelect: (groupId: string | null) => void;
    showAllOption?: boolean;
    label?: string;
    panelVariant?: PanelVariant | null;
  }

  let {
    groups,
    selectedGroupId,
    onSelect,
    showAllOption = true,
    label = "分组筛选",
    panelVariant = null,
  }: Props = $props();

  let layoutMode = $state<LayoutMode>(browser ? get(layout) : "sidebar");

  if (browser) {
    $effect(() => {
      const unsubscribe = layout.subscribe((mode) => {
        layoutMode = mode;
      });
      return unsubscribe;
    });
  }

  type FlatGroup = {
    id: string;
    label: string;
    depth: number;
    count: number;
  };

  function flattenGroups(
    source: NavGroup[],
    parents: string[] = [],
  ): FlatGroup[] {
    const acc: FlatGroup[] = [];
    source.forEach((group) => {
      const path = [...parents, group.name];
      acc.push({
        id: group.id,
        label: path.join(" / "),
        depth: parents.length,
        count: countGroupItems(group),
      });

      if (group.children && group.children.length > 0) {
        acc.push(...flattenGroups(group.children, path));
      }
    });
    return acc;
  }

  const flatGroups = $derived(flattenGroups(groups));

  const resolvedVariant = $derived(panelVariant ?? layoutMode);
  const isVertical = $derived(resolvedVariant === "vertical");

  function handleSelect(groupId: string | null) {
    if (groupId === selectedGroupId) {
      return;
    }
    onSelect(groupId);
  }
</script>

<section
  class="group-filter-panel"
  class:vertical={isVertical}
  aria-labelledby="group-filter-heading"
>
  <div class="filter-bar">
    <h3 id="group-filter-heading">{label}</h3>
    {#if selectedGroupId !== null}
      <button class="filter-clear" onclick={() => handleSelect(null)}>
        清除分组
      </button>
    {/if}
  </div>

  <div class="group-chip-list" role="list">
    {#if showAllOption}
      <button
        class="group-chip"
        class:active={selectedGroupId === null}
        onclick={() => handleSelect(null)}
        role="listitem"
      >
        <span class="group-chip-name">全部</span>
      </button>
    {/if}
    {#each flatGroups as group (group.id)}
      <button
        class="group-chip"
        class:active={selectedGroupId === group.id}
        onclick={() => handleSelect(group.id)}
        role="listitem"
        title={`该分组包含 ${group.count} 个网站`}
      >
        <span class="group-chip-name">{group.label}</span>
        <span class="group-chip-count">{group.count}</span>
      </button>
    {/each}
  </div>
</section>

<style>
  .group-filter-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  }

  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }

  .filter-bar h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .filter-clear {
    border: none;
    background: none;
    color: var(--primary-color);
    font-size: 0.8125rem;
    cursor: pointer;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    transition: all var(--transition-base);
  }

  .filter-clear:hover {
    text-decoration: underline;
  }

  .group-chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .group-chip {
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    color: var(--text-secondary);
    border-radius: 999px;
    padding: 0.45rem 0.75rem;
    font-size: 0.8125rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    transition: all var(--transition-fast);
  }

  .group-chip:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-light);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .group-chip.active {
    background: linear-gradient(
      135deg,
      var(--primary-color) 0%,
      var(--accent-color, #8b5cf6) 100%
    );
    color: var(--text-inverse);
    border-color: transparent;
    box-shadow: var(--shadow-md);
  }

  .group-chip-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    padding: 0.1rem 0.35rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    font-size: 0.7rem;
    font-weight: 600;
  }

  .group-chip.active .group-chip-count {
    background: rgba(255, 255, 255, 0.24);
  }

  .group-chip-name {
    max-width: 10rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .group-filter-panel.vertical .group-chip-name {
    max-width: 100%;
    white-space: normal;
  }

  @media (max-width: 768px) {
    .group-filter-panel {
      padding: var(--spacing-sm);
      gap: var(--spacing-xs);
    }

    .group-chip {
      font-size: 0.75rem;
      padding: 0.4rem 0.65rem;
    }
  }
</style>


