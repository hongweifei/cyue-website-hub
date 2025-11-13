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
    if (resolvedVariant !== lastVariant) {
      expandAll = resolvedVariant !== "vertical";
      lastVariant = resolvedVariant;
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
    >
      {expandAll ? "收起分组" : `展开更多分组（共 ${flatGroups.length} 个）`}
    </button>
  {/if}
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
    box-shadow: inset 0 1px 0 var(--chip-contrast-surface);
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
    border-color: var(--border-accent);
    color: var(--primary-color);
    background: var(--layer-primary-soft);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .group-chip.active {
    background: var(--gradient-brand);
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
    background: var(--chip-contrast-surface);
    font-size: 0.7rem;
    font-weight: 600;
  }

  .group-chip.active .group-chip-count {
    background: var(--chip-contrast-surface-strong);
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

  .group-toggle {
    margin-top: var(--spacing-sm);
    align-self: flex-start;
    border: none;
    background: transparent;
    color: var(--primary-color);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    transition: color var(--transition-fast), background var(--transition-fast);
  }

  .group-toggle:hover {
    color: var(--primary-hover);
    background: var(--layer-primary-soft);
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


