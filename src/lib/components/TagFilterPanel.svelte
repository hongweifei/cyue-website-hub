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

<div class="tag-filter-panel" class:stacked={isStackLayout}>
  <div class="panel-header">
    <div class="header-title">
      <h3>标签筛选</h3>
      <span class="tag-count">
        {#if filteredCount === totalTagCount}
          共 {totalTagCount} 个标签
        {:else}
          {filteredCount} / {totalTagCount} 个标签
        {/if}
      </span>
    </div>
    {#if selectedTags.length > 0}
      <button class="clear-btn" onclick={handleClear}>清除选中</button>
    {/if}
  </div>

  <div class="panel-meta" aria-live="polite">
    <div class="meta-summary">
      {#if selectedCount > 0}
        <span class="meta-chip selected-chip">{selectedCount} 个已选</span>
      {/if}
      {#if hasGroupContext}
        <span class="meta-chip">当前分组包含 {groupTagCount} 个标签</span>
      {/if}
      <span class="meta-chip muted">
        {remainingCount > 0 && !showAll
          ? `已显示 ${visibleTags.length} 个`
          : `共 ${orderedTags.length} 个可选`}
      </span>
    </div>
    {#if remainingCount > 0 || showAll}
      <button class="secondary-action" onclick={handleShowAllToggle}>
        {showAll ? "收起全部标签" : "展开全部标签"}
      </button>
    {/if}
  </div>

  {#if hasGroupContext}
    <div class="group-toggle" role="radiogroup">
      <button
        class="group-toggle-btn"
        class:active={!showGroupOnly}
        onclick={() => handleSetGroupMode(false)}
        aria-pressed={!showGroupOnly}
      >
        全部标签
      </button>
      <button
        class="group-toggle-btn"
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
      class="search-input"
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
            class="quick-tag"
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
      <div class="empty-state">没有匹配的标签</div>
    {:else}
      {#each visibleTags as tag (tag.name)}
        <button
          class="tag-pill"
          class:selected={selectedSet.has(tag.name)}
          class:ingroup={!selectedSet.has(tag.name) && groupTagSet.has(tag.name)}
          onclick={() => onToggle(tag.name)}
          title={`共有 ${tag.count} 个网站使用标签“${tag.name}”`}
        >
          <span class="tag-name">{tag.name}</span>
          <span class="tag-meta">
            <span class="tag-count-badge">{tag.count}</span>
            <!-- {#if showGroupCount}
              <span class="tag-group-count">{tag.groupCount}</span>
            {/if} -->
          </span>
        </button>
      {/each}
    {/if}
  </div>

  {#if remainingCount > 0}
    <button class="toggle-btn" onclick={handleShowAllToggle}>
      {showAll ? "收起标签" : `展开更多标签（+${remainingCount}）`}
    </button>
  {/if}
</div>

<style>
  .tag-filter-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }

  .panel-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .meta-summary {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    align-items: center;
  }

  .meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: calc(var(--spacing-xs) * 0.5) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    background: var(--primary-lighter);
    color: var(--text-secondary);
    border: 1px solid var(--border-light);
    transition: all var(--transition-fast);
  }

  .meta-chip.selected-chip {
    background: var(--primary-light);
    color: var(--primary-color);
    border-color: var(--border-accent);
    font-weight: 500;
  }

  .meta-chip.muted {
    background: transparent;
    color: var(--text-tertiary);
    border-color: var(--border-light);
  }

  .secondary-action {
    border: none;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    font-size: 0.75rem;
    padding: calc(var(--spacing-xs) * 0.75) var(--spacing-sm);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all var(--transition-fast);
    border: 1px solid var(--border-light);
  }

  .secondary-action:hover {
    background: var(--primary-lighter);
    color: var(--primary-color);
    border-color: var(--border-accent);
  }

  .header-title {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm);
  }

  .header-title h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .tag-count {
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }

  .clear-btn {
    border: none;
    background: none;
    color: var(--primary-color);
    font-size: 0.8125rem;
    cursor: pointer;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    transition: all var(--transition-base);
  }

  .clear-btn:hover {
    text-decoration: underline;
  }

  .group-toggle {
    display: inline-flex;
    gap: 0.25rem;
    padding: 0.25rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-light);
    background: var(--bg-secondary);
    width: max-content;
  }

  .group-toggle-btn {
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    font-size: 0.8125rem;
    padding: calc(var(--spacing-xs) * 0.75) var(--spacing-sm);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-weight: 500;
  }

  .group-toggle-btn:hover {
    color: var(--primary-color);
    background: var(--primary-lighter);
  }

  .group-toggle-btn.active {
    background: var(--primary-light);
    color: var(--primary-color);
    box-shadow: var(--shadow-xs);
    font-weight: 600;
  }

  .search-wrapper {
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: calc(var(--spacing-sm) * 0.875) var(--spacing-md);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-light);
    background: var(--input-bg);
    box-shadow: var(--shadow-xs);
    font-size: 0.875rem;
    transition: all var(--transition-fast);
  }

  .search-input::placeholder {
    color: var(--text-tertiary);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: var(--shadow-xs), 0 0 0 2px var(--primary-lighter);
    background: var(--card-bg);
  }

  .search-input:hover:not(:focus) {
    border-color: var(--border-color);
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
    border: 1px solid var(--border-light);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border-radius: var(--radius-full);
    padding: calc(var(--spacing-xs) * 0.75) var(--spacing-sm);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-weight: 500;
  }

  .quick-tag:hover {
    border-color: var(--border-accent);
    color: var(--primary-color);
    background: var(--primary-lighter);
    transform: translateY(-1px);
    box-shadow: var(--shadow-xs);
  }

  .quick-tag.selected {
    background: var(--gradient-brand);
    color: var(--text-inverse);
    border-color: transparent;
    box-shadow: var(--shadow-xs);
    font-weight: 600;
  }

  .tag-grid {
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--spacing-xs);
    row-gap: var(--spacing-sm);
  }

  .tag-filter-panel.stacked .tag-grid {
    flex-direction: column;
    column-gap: 0;
    row-gap: var(--spacing-xs);
  }

  .tag-pill {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--spacing-xs);
    padding: calc(var(--spacing-sm) * 0.875) var(--spacing-md);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-light);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.8125rem;
    text-align: left;
    flex: 0 1 auto;
    max-width: 100%;
    flex-wrap: wrap;
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

  .tag-pill:hover {
    border-color: var(--border-accent);
    color: var(--primary-color);
    background: var(--primary-lighter);
    transform: translateY(-1px);
    box-shadow: var(--shadow-xs);
  }

  .tag-pill.selected {
    background: var(--gradient-brand);
    color: var(--text-inverse);
    border-color: transparent;
    box-shadow: var(--shadow-xs);
    font-weight: 600;
  }

  .tag-pill.ingroup {
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.75rem;
    padding: 0.1rem 0.35rem;
    border-radius: 999px;
    background: var(--chip-contrast-surface);
    color: inherit;
  }

  .tag-pill.selected .tag-count-badge {
    background: var(--chip-contrast-surface-strong);
  }

  .toggle-btn {
    align-self: flex-start;
    border: none;
    background: none;
    color: var(--primary-color);
    font-size: 0.8125rem;
    cursor: pointer;
    padding: var(--spacing-xs) 0;
    transition: color var(--transition-base);
  }

  .toggle-btn:hover {
    text-decoration: underline;
  }

  .empty-state {
    grid-column: 1 / -1;
    padding: var(--spacing-lg);
    text-align: center;
    color: var(--text-tertiary);
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px dashed var(--border-light);
  }

  @media (max-width: 768px) {
    .panel-meta {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-xs);
    }

    .secondary-action {
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

