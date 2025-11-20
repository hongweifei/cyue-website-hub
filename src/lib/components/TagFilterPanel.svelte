<script lang="ts">
  import { browser } from "$app/environment";
  import type { TagSummary } from "$lib/types";
  import { layout, type LayoutMode } from "$lib/stores/layout";
  import { get } from "svelte/store";

  type PanelLayout = "grid" | "stack";

  interface Props {
    tags: TagSummary[];
    selectedTags: string[];
    onToggle: (tag: string) => void;
    limit?: number;
    enableGroupCount?: boolean;
    selectedGroupId?: string | null;
    panelLayout?: PanelLayout | null;
  }

  let {
    tags,
    selectedTags,
    onToggle,
    limit = 18,
    enableGroupCount = true,
    selectedGroupId = null,
    panelLayout = null,
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

  let searchQuery = $state("");
  let showAll = $state(false);
  let showGroupOnly = $state(false);

  const normalizedQuery = $derived(searchQuery.trim().toLowerCase());
  const selectedSet = $derived(new Set(selectedTags));
  const currentGroupId = $derived(selectedGroupId ?? null);

const groupTagSet = $derived(((): Set<string> => {
    if (!currentGroupId) {
      return new Set<string>();
    }
    return new Set(
      tags
        .filter((tag) => tag.groupIds.includes(currentGroupId))
        .map((tag) => tag.name),
    );
  })());

  const hasGroupContext = $derived(currentGroupId !== null && groupTagSet.size > 0);

  $effect(() => {
    if (!hasGroupContext) {
      showGroupOnly = false;
    }
  });

const tagPool = $derived(((): TagSummary[] => {
    if (hasGroupContext && showGroupOnly) {
      return tags.filter((tag) => groupTagSet.has(tag.name));
    }
    return tags;
  })());

const filteredTags = $derived(((): TagSummary[] => {
    if (!normalizedQuery) {
      return tagPool;
    }
    return tagPool.filter((tag) =>
      tag.name.toLowerCase().includes(normalizedQuery),
    );
  })());

const orderedTags = $derived(((): TagSummary[] => {
    const selected: TagSummary[] = [];
    const prioritized: TagSummary[] = [];
    const others: TagSummary[] = [];

    filteredTags.forEach((tag) => {
      if (selectedSet.has(tag.name)) {
        selected.push(tag);
        return;
      }
      if (hasGroupContext && groupTagSet.has(tag.name)) {
        prioritized.push(tag);
        return;
      }
      others.push(tag);
    });

    return [...selected, ...prioritized, ...others];
  })());

const visibleTags = $derived(((): TagSummary[] => {
    if (showAll || normalizedQuery) {
      return orderedTags;
    }
    return orderedTags.slice(0, limit);
  })());

const remainingCount = $derived(
    Math.max(0, orderedTags.length - visibleTags.length),
  );

const totalTagCount = $derived(tags.length);
const filteredCount = $derived(filteredTags.length);
const selectedCount = $derived(selectedTags.length);
const groupTagCount = $derived(groupTagSet.size);

const quickTags = $derived(((): TagSummary[] => {
    const source = hasGroupContext
      ? tags.filter((tag) => groupTagSet.has(tag.name))
      : tags;
    return source.slice(0, Math.min(8, source.length));
  })());

const showQuickTags = $derived(
    !normalizedQuery && quickTags.length > 0 && !showGroupOnly,
  );

const resolvedLayout = $derived(
    panelLayout ?? (layoutMode === "sidebar" ? "stack" : "grid"),
  );
const isStackLayout = $derived(resolvedLayout === "stack");
const showGroupCount = $derived(enableGroupCount && !isStackLayout);

  function handleClear() {
    selectedTags.forEach((tag) => onToggle(tag));
  }

  function handleShowAllToggle() {
    showAll = !showAll;
  }

  function handleSetGroupMode(next: boolean) {
    if (showGroupOnly === next) {
      return;
    }
    showGroupOnly = next;
    if (next) {
      showAll = true;
    }
  }
</script>

<div class="tag-filter-panel component-card-default component-panel" class:stacked={isStackLayout}>
  <div class="panel-header component-panel-header">
    <div class="header-title">
      <h3 class="component-panel-title">标签筛选</h3>
      <span class="tag-count component-panel-caption">
        {#if filteredCount === totalTagCount}
          共 {totalTagCount} 个标签
        {:else}
          {filteredCount} / {totalTagCount} 个标签
        {/if}
      </span>
    </div>
    {#if selectedTags.length > 0}
      <button class="clear-btn component-link-default" onclick={handleClear}>
        清除选中
      </button>
    {/if}
  </div>

  <div class="panel-meta component-panel-meta" aria-live="polite">
    <div class="meta-summary component-meta-summary">
      {#if selectedCount > 0}
        <span class="meta-chip component-meta-chip selected">{selectedCount} 个已选</span>
      {/if}
      {#if hasGroupContext}
        <span class="meta-chip component-meta-chip">当前分组包含 {groupTagCount} 个标签</span>
      {/if}
      <span class="meta-chip component-meta-chip muted">
        {remainingCount > 0 && !showAll
          ? `已显示 ${visibleTags.length} 个`
          : `共 ${orderedTags.length} 个可选`}
      </span>
    </div>
    {#if remainingCount > 0 || showAll}
      <button
        class="secondary-action component-button-ghost component-secondary-action"
        onclick={handleShowAllToggle}
      >
        {showAll ? "收起全部标签" : "展开全部标签"}
      </button>
    {/if}
  </div>

  {#if hasGroupContext}
    <div class="group-toggle component-toggle" role="radiogroup">
      <button
        class="group-toggle-btn component-toggle-btn"
        class:active={!showGroupOnly}
        onclick={() => handleSetGroupMode(false)}
        aria-pressed={!showGroupOnly}
      >
        全部标签
      </button>
      <button
        class="group-toggle-btn component-toggle-btn"
        class:active={showGroupOnly}
        onclick={() => handleSetGroupMode(true)}
        aria-pressed={showGroupOnly}
      >
        仅当前分组
      </button>
    </div>
  {/if}

  <div class="search-wrapper">
    <input
      class="search-input component-input-default"
      type="search"
      placeholder="搜索标签或关键字…"
      bind:value={searchQuery}
    />
  </div>

  {#if showQuickTags}
    <div class="quick-tags">
      <span class="quick-tags-label">热门标签：</span>
      <div class="quick-tags-list">
        {#each quickTags as tag (tag.name)}
          <button
            class="quick-tag component-tag-default"
            class:selected={selectedSet.has(tag.name)}
            onclick={() => onToggle(tag.name)}
            title={`共有 ${tag.count} 个网站使用“${tag.name}”`}
          >
            {tag.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <div class="tag-grid" class:stacked={isStackLayout}>
    {#if visibleTags.length === 0}
      <div class="empty-state component-empty-state">没有匹配的标签</div>
    {:else}
      {#each visibleTags as tag (tag.name)}
        <button
          class="tag-pill component-chip component-tag-default"
          class:selected={selectedSet.has(tag.name)}
          class:ingroup={!selectedSet.has(tag.name) && groupTagSet.has(tag.name)}
          onclick={() => onToggle(tag.name)}
          title={`共有 ${tag.count} 个网站使用标签“${tag.name}”`}
        >
          <span class="tag-name">{tag.name}</span>
          <span class="tag-meta">
            <span class="tag-count-badge component-chip-badge component-badge-default">
              {tag.count}
            </span>
            <!-- {#if showGroupCount}
              <span class="tag-group-count">{tag.groupCount}</span>
            {/if} -->
          </span>
        </button>
      {/each}
    {/if}
  </div>

  {#if remainingCount > 0}
    <button
      class="toggle-btn component-button-secondary component-secondary-action"
      onclick={handleShowAllToggle}
    >
      {showAll ? "收起标签" : `展开更多标签（+${remainingCount}）`}
    </button>
  {/if}
</div>

<style>
  .tag-filter-panel {
    gap: var(--spacing-md);
  }

  .header-title {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm);
  }

  .clear-btn {
    border: none;
    background: none;
    color: var(--component-link-default-color, var(--primary-color));
    font-size: 0.8125rem;
    cursor: pointer;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    transition: var(
      --component-link-default-transition,
      color var(--transition-base)
    );
  }

  .clear-btn:hover {
    color: var(--component-link-default-color-hover, var(--primary-hover));
    text-decoration: underline;
  }

  .group-toggle {
    width: max-content;
  }

  .search-wrapper {
    position: relative;
  }

  .search-input {
    width: 100%;
    font-size: 0.875rem;
  }

  .quick-tags {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .quick-tags-label {
    font-size: 0.8125rem;
    color: var(--text-tertiary);
    line-height: 1.8;
  }

  .quick-tags-list {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }

  .quick-tag {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .quick-tag.selected {
    font-weight: 600;
  }

  .tag-grid {
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--spacing-xs);
    row-gap: var(--spacing-sm);
  }

  .tag-filter-panel:not(.stacked) .tag-grid {
    flex: 0 1 auto;
    max-height: clamp(180px, 32vh, 320px);
    overflow-y: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    padding-right: var(--spacing-xs);
    margin-right: calc(var(--spacing-xs) * -1);
  }

  .tag-filter-panel:not(.stacked) .tag-grid::-webkit-scrollbar {
    width: 6px;
  }

  .tag-filter-panel:not(.stacked) .tag-grid::-webkit-scrollbar-track {
    background: transparent;
  }

  .tag-filter-panel:not(.stacked) .tag-grid::-webkit-scrollbar-thumb {
    background: var(--border-light);
    border-radius: 999px;
    transition: background var(--transition-fast);
  }

  .tag-filter-panel:not(.stacked) .tag-grid::-webkit-scrollbar-thumb:hover {
    background: var(--border-color);
  }

  .tag-filter-panel.stacked .tag-grid {
    flex-direction: column;
    column-gap: 0;
    row-gap: var(--spacing-xs);
  }

  .tag-pill {
    width: 100%;
    text-align: left;
    flex: 0 1 auto;
    flex-wrap: wrap;
    font-size: 0.8125rem;
    font-weight: 500;
    row-gap: 0.3rem;
  }

  .tag-filter-panel.stacked .tag-pill {
    width: 100%;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0.4rem;
    row-gap: 0.4rem;
  }

  .tag-pill.ingroup:not(.selected) {
    border-color: var(--border-accent);
    background: var(--primary-lighter);
    color: var(--primary-color);
  }

  .tag-name {
    flex: 1 1 auto;
    min-width: 0;
    white-space: normal;
    word-break: break-word;
    line-height: 1.3;
  }

  .tag-meta {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    font-weight: 600;
    flex-wrap: wrap;
    margin-left: auto;
    flex-shrink: 0;
  }

  .tag-filter-panel.stacked .tag-meta {
    justify-content: flex-end;
    margin-left: auto;
    flex-wrap: nowrap;
    gap: 0.35rem;
  }

  .tag-count-badge {
    min-width: 1.75rem;
    font-weight: 500;
  }

  .toggle-btn {
    align-self: flex-start;
    margin-top: var(--spacing-sm);
  }

  @media (max-width: 768px) {
    .component-panel-meta {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-xs);
    }

    .component-secondary-action {
      width: 100%;
      text-align: center;
    }

    .tag-pill {
      font-size: 0.75rem;
      padding: 0.45rem 0.6rem;
      flex: 0 0 auto;
      min-width: 0;
    }

    .tag-filter-panel.stacked .tag-pill {
      width: 100%;
    }

    .quick-tags {
      flex-direction: column;
      align-items: stretch;
    }

    .quick-tags-label {
      line-height: 1.4;
    }
  }
</style>

