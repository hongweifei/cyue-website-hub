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
  const VERTICAL_PREVIEW_LIMIT = 12;

  let expandAll = $state(false);
  let lastVariant = $state<LayoutMode>("sidebar");
  let hasInitialized = $state(false);

  const visibleGroups = $derived.by(() => {
    if (!isVertical || expandAll) {
      return flatGroups;
    }
    return flatGroups.slice(0, VERTICAL_PREVIEW_LIMIT);
  });

  const shouldShowToggle = $derived.by(
    () => isVertical && flatGroups.length > VERTICAL_PREVIEW_LIMIT,
  );

  $effect(() => {
    if (!hasInitialized || resolvedVariant !== lastVariant) {
      expandAll = resolvedVariant !== "vertical";
      lastVariant = resolvedVariant;
      hasInitialized = true;
    }
  });

  function handleSelect(groupId: string | null) {
    if (groupId === selectedGroupId) {
      return;
    }
    onSelect(groupId);
  }
</script>

<section
  class="group-filter-panel component-card-default component-panel gap-sm"
  class:vertical={isVertical}
  class:collapsed={isVertical && shouldShowToggle && !expandAll}
  aria-labelledby="group-filter-heading"
>
  <div class="filter-bar component-panel-header">
    <h3 id="group-filter-heading" class="component-panel-title">{label}</h3>
    {#if selectedGroupId !== null}
      <button
        class="filter-clear component-button-ghost component-secondary-action"
        onclick={() => handleSelect(null)}
      >
        清除分组
      </button>
    {/if}
  </div>

  <div class="group-chip-list component-chip-list">
    {#if showAllOption}
      <button
        class="group-chip component-chip component-tag-default"
        class:active={selectedGroupId === null}
        onclick={() => handleSelect(null)}
      >
        <span class="group-chip-name">全部</span>
      </button>
    {/if}
    {#each visibleGroups as group (group.id)}
      <button
        class="group-chip component-chip component-tag-default"
        class:active={selectedGroupId === group.id}
        onclick={() => handleSelect(group.id)}
        title={`该分组包含 ${group.count} 个网站`}
      >
        <span class="group-chip-name">{group.label}</span>
        <span class="group-chip-count component-chip-badge component-badge-default">
          {group.count}
        </span>
      </button>
    {/each}
  </div>
  {#if shouldShowToggle}
    <button
      class="group-toggle component-button-ghost component-secondary-action"
      type="button"
      onclick={() => (expandAll = !expandAll)}
      aria-expanded={expandAll}
    >
      {expandAll
        ? "收起分组"
        : `展开更多分组（共 ${flatGroups.length} 个）`}
    </button>
  {/if}
</section>

<style>
  .group-chip-list {
    flex: 1;
  }

  .group-chip {
    font-size: 0.8125rem;
    font-weight: 500;
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

  .group-filter-panel.vertical .group-chip-list {
    width: 100%;
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    padding-right: var(--spacing-xs);
    margin-right: calc(var(--spacing-xs) * -1);
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  .group-filter-panel.vertical .group-chip-list::-webkit-scrollbar {
    width: 6px;
  }

  .group-filter-panel.vertical .group-chip-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .group-filter-panel.vertical .group-chip-list::-webkit-scrollbar-thumb {
    background: var(--border-light);
    border-radius: 999px;
    transition: background var(--transition-fast);
  }

  .group-filter-panel.vertical .group-chip-list::-webkit-scrollbar-thumb:hover {
    background: var(--border-color);
  }

  .group-toggle {
    margin-top: var(--spacing-sm);
    align-self: flex-start;
  }

  @media (max-width: 768px) {
    .group-filter-panel {
      padding: var(--spacing-sm);
      gap: var(--spacing-xs);
    }

    .group-chip {
      font-size: 0.75rem;
      padding: var(--component-tag-default-padding, 0.4rem 0.65rem);
    }

    /* 修复垂直布局下移动端分组筛选显示问题 */
    .group-filter-panel.vertical {
      min-height: 200px;
      max-height: 300px;
    }

    .group-filter-panel.vertical .group-chip-list {
      flex: 1 1 auto;
      min-height: 120px;
      max-height: 240px;
      overflow-y: auto;
      /* 增加滚动条可见性 */
      padding-right: var(--spacing-sm);
      margin-right: calc(var(--spacing-sm) * -1);
    }

    /* 移动端滚动条优化 */
    .group-filter-panel.vertical .group-chip-list::-webkit-scrollbar {
      width: 8px;
    }

    .group-filter-panel.vertical .group-chip-list::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }

    .group-filter-panel.vertical .group-chip-list::-webkit-scrollbar-track {
      background: var(--bg-tertiary);
      border-radius: 4px;
    }
  }
</style>


