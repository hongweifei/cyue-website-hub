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
  class="group-filter-panel"
  class:vertical={isVertical}
  class:collapsed={isVertical && shouldShowToggle && !expandAll}
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

  <div class="group-chip-list">
    {#if showAllOption}
      <button
        class="group-chip"
        class:active={selectedGroupId === null}
        onclick={() => handleSelect(null)}
      >
        <span class="group-chip-name">全部</span>
      </button>
    {/if}
    {#each visibleGroups as group (group.id)}
      <button
        class="group-chip"
        class:active={selectedGroupId === group.id}
        onclick={() => handleSelect(group.id)}
        title={`该分组包含 ${group.count} 个网站`}
      >
        <span class="group-chip-name">{group.label}</span>
        <span class="group-chip-count">{group.count}</span>
      </button>
    {/each}
  </div>
  {#if shouldShowToggle}
    <button
      class="group-toggle"
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
  .group-filter-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--component-card-default-padding, var(--spacing-md));
    background: var(--component-card-default-bg, var(--bg-secondary));
    border-radius: var(--component-card-default-radius, var(--radius-xl));
    border: 1px solid var(--component-card-default-border, var(--border-light));
    transition: var(
      --component-card-default-transition,
      border-color var(--transition-fast),
      background-color var(--transition-fast),
      box-shadow var(--transition-fast)
    );
    box-shadow: var(--component-card-default-shadow, var(--shadow-xs));
    backdrop-filter: var(--component-card-default-backdrop, blur(8px));
    -webkit-backdrop-filter: var(--component-card-default-backdrop, blur(8px));
  }

  .group-filter-panel:hover {
    border-color: var(--border-accent);
    background: var(--component-card-default-bg-hover, var(--surface-glass));
    box-shadow: var(--component-card-default-shadow-hover, var(--shadow-sm));
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
    border: 1px solid var(--component-button-ghost-border, var(--border-light));
    background: var(--component-button-ghost-bg, var(--bg-tertiary));
    color: var(--component-button-ghost-color, var(--primary-color));
    font-size: 0.8125rem;
    cursor: pointer;
    padding: var(--component-button-ghost-padding, calc(var(--spacing-xs) * 0.75) var(--spacing-sm));
    border-radius: var(--component-button-ghost-radius, var(--radius-full));
    transition: var(
      --component-button-ghost-transition,
      color var(--transition-fast),
      background-color var(--transition-fast),
      border-color var(--transition-fast),
      transform var(--transition-fast),
      box-shadow var(--transition-fast)
    );
    font-weight: 500;
  }

  .filter-clear:hover {
    background: var(--component-button-ghost-bg-hover, var(--primary-lighter));
    border-color: var(--component-button-ghost-border-hover, var(--border-accent));
    color: var(--component-button-ghost-color-hover, var(--primary-color));
    transform: translateY(-1px);
    box-shadow: var(--component-button-secondary-shadow-hover, var(--shadow-xs));
  }

  .group-chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    flex: 1;
  }

  .group-chip {
    border: 1px solid var(--component-tag-default-border, var(--border-light));
    background: var(--component-tag-default-bg, var(--bg-tertiary));
    color: var(--component-tag-default-color, var(--text-secondary));
    border-radius: var(--component-tag-default-radius, var(--radius-full));
    padding: var(--component-tag-default-padding, calc(var(--spacing-xs) * 0.875) var(--spacing-md));
    font-size: 0.8125rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    transition: var(--component-tag-default-transition, all var(--transition-fast));
    font-weight: 500;
    box-shadow: var(--component-tag-default-shadow, none);
  }

  .group-chip:hover {
    border-color: var(--component-tag-default-border-hover, var(--border-accent));
    color: var(--component-tag-default-color-hover, var(--primary-color));
    background: var(--component-tag-default-bg-hover, var(--primary-lighter));
    transform: translateY(-1px);
    box-shadow: var(--component-tag-default-shadow-hover, var(--shadow-xs));
  }

  .group-chip.active {
    background: var(--component-tag-primary-bg, var(--gradient-brand));
    color: var(--component-tag-primary-color, var(--text-inverse));
    border-color: var(--component-tag-primary-border, transparent);
    box-shadow: var(--component-tag-primary-shadow, var(--shadow-xs));
    font-weight: 600;
  }

  .group-chip-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    padding: var(--component-badge-default-padding, calc(var(--spacing-2xs) * 0.5) calc(var(--spacing-xs) * 0.75));
    border-radius: var(--component-badge-default-radius, var(--radius-full));
    background: var(--component-badge-default-bg, var(--primary-lighter));
    border: 1px solid var(--component-badge-default-border, var(--border-accent));
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--component-badge-default-color, var(--primary-color));
  }

  .group-chip.active .group-chip-count {
    background: var(--component-badge-primary-bg, rgba(255, 255, 255, 0.2));
    border-color: var(--component-badge-primary-border, rgba(255, 255, 255, 0.3));
    color: var(--component-badge-primary-color, var(--text-inverse));
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
    border: 1px solid var(--component-button-ghost-border, var(--border-light));
    background: var(--component-button-ghost-bg, var(--bg-tertiary));
    color: var(--component-link-default-color, var(--primary-color));
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    padding: var(--component-button-ghost-padding, calc(var(--spacing-xs) * 0.75) var(--spacing-sm));
    border-radius: var(--component-button-ghost-radius, var(--radius-full));
    transition: var(
      --component-button-ghost-transition,
      color var(--transition-fast),
      background-color var(--transition-fast),
      border-color var(--transition-fast),
      transform var(--transition-fast),
      box-shadow var(--transition-fast)
    );
  }

  .group-toggle:hover {
    color: var(--component-link-default-color-hover, var(--primary-color));
    background: var(--component-button-ghost-bg-hover, var(--primary-lighter));
    border-color: var(--component-button-ghost-border-hover, var(--border-accent));
    transform: translateY(-1px);
    box-shadow: var(--component-button-secondary-shadow-hover, var(--shadow-xs));
  }

  @media (max-width: 768px) {
    .group-filter-panel {
      padding: var(--component-card-default-padding, var(--spacing-sm));
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


