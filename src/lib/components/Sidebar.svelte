<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import SearchBar from './SearchBar.svelte';
	import TagFilterPanel from './TagFilterPanel.svelte';
	import SidebarGroupTree from './SidebarGroupTree.svelte';
	import { countGroupItems } from '../utils/group';
	import type { TagSummary } from '../types';

	interface Props {
		groups: NavGroupType[];
		selectedGroupId: string | null;
		tagSummaries: TagSummary[];
		selectedTags: string[];
		searchQuery: string;
		onGroupSelect: (groupId: string | null) => void;
		onSearch: (value: string) => void;
		onTagToggle: (tag: string) => void;
	}

	let {
		groups,
		selectedGroupId,
		tagSummaries,
		selectedTags,
		searchQuery,
		onGroupSelect,
		onSearch,
		onTagToggle
	}: Props = $props();

	const totalItems = $derived(
		groups.reduce((sum, group) => sum + countGroupItems(group), 0)
	);
	const totalGroups = $derived(groups.length);
</script>

<aside class="sidebar component-card-glass">
	<div class="sidebar-header">
		<h2 class="sidebar-title">分组</h2>
	</div>
	<div class="sidebar-section search">
		<div class="sidebar-section-header">
			<h3 class="sidebar-section-title">快速搜索</h3>
		</div>
		<SearchBar value={searchQuery} onInput={onSearch} />
	</div>
	<div class="sidebar-section filters">
		<TagFilterPanel
			tags={tagSummaries}
			{selectedTags}
			onToggle={onTagToggle}
			panelLayout="stack"
		/>
	</div>
	<nav class="sidebar-nav">
		<button
			class="sidebar-group-btn root component-button-secondary"
			class:component-button-primary={selectedGroupId === null}
			onclick={() => onGroupSelect(null)}
			aria-pressed={selectedGroupId === null}
			type="button"
		>
			<span
				class="sidebar-group-icon root-icon component-tag-default"
				class:component-tag-primary={selectedGroupId === null}
				aria-hidden="true"
			>
				📚
			</span>
			<div class="sidebar-group-content">
				<span class="sidebar-group-name">全部</span>
				<span class="sidebar-group-meta">{totalGroups} 个分组 · {totalItems} 个网站</span>
			</div>
			<span
				class="sidebar-group-count component-badge-default"
				class:component-badge-primary={selectedGroupId === null}
			>
				{totalItems}
			</span>
		</button>
		<SidebarGroupTree
			{groups}
			{selectedGroupId}
			onSelect={(groupId) => onGroupSelect(groupId)}
		/>
	</nav>
</aside>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		overflow: visible;
		transform: translateZ(0);
		contain: layout style paint;
	}

	@media (min-width: 1025px) {
		.sidebar {
			position: sticky;
			top: calc(var(--spacing-xl) + 64px);
			max-height: calc(100vh - 96px);
			overflow-x: hidden;
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;
			scroll-behavior: smooth;
		}
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.sidebar-title {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.sidebar-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		/* 移除卡片样式，避免嵌套 */
		padding: 0;
		background: transparent;
		border: none;
		border-radius: 0;
	}

	.sidebar-section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-xs);
	}

	.sidebar-section-title {
		margin: 0;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.sidebar-section.filters {
		gap: var(--spacing-md);
	}

	.sidebar-section.search :global(.search-bar) {
		max-width: 100%;
		margin: 0;
	}

	.sidebar-section :global(.search-input) {
		box-shadow: var(--component-input-default-shadow, var(--shadow-xs));
		border-width: 1px;
		border-radius: var(--radius-xl);
		background: var(--input-bg);
	}

	.sidebar-section :global(.search-input:focus) {
		box-shadow: var(--component-input-default-shadow-focus, var(--shadow-sm)), 0 0 0 2px
			var(--primary-lighter);
	}

	.sidebar-section :global(.clear-btn) {
		background: transparent;
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	@media (max-width: 1024px) {
		.sidebar {
			position: static;
			top: auto;
			max-height: none;
			overflow: visible;
			padding: var(--spacing-lg);
			gap: var(--spacing-lg);
		}
	}

	@media (max-width: 768px) {
		.sidebar {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.sidebar {
			padding: var(--spacing-md);
		}
	}

	.sidebar-group-btn.root {
		background: var(--component-button-secondary-bg, var(--primary-lighter));
		border: 1px solid var(--component-button-secondary-border, var(--border-accent));
		box-shadow: var(--component-button-secondary-shadow, var(--shadow-xs));
	}

	.sidebar-group-btn.root:hover {
		background: var(--component-button-secondary-bg-hover, var(--primary-light));
		transform: translateX(2px) translateZ(0);
		box-shadow: var(--component-button-secondary-shadow-hover, var(--shadow-sm));
	}

	.sidebar-group-btn.root .sidebar-group-icon {
		background: var(--component-tag-primary-bg, var(--primary-light));
		color: var(--component-tag-primary-color, var(--primary-color));
		border-color: var(--component-tag-primary-border, var(--border-accent));
	}

	.sidebar-group-btn.root .sidebar-group-count {
		background: var(--component-badge-default-bg, var(--primary-light));
		border-color: var(--component-badge-default-border, var(--border-accent));
		color: var(--component-badge-default-color, var(--primary-color));
	}

	.sidebar-group-btn.root.component-button-primary {
		background: var(--component-button-primary-bg, var(--gradient-brand));
		border-color: transparent;
		color: var(--component-button-primary-color, var(--text-inverse));
		box-shadow: var(--component-button-primary-shadow, var(--shadow-xs));
	}

	.sidebar-group-btn.root.component-button-primary .sidebar-group-count {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.3);
		color: var(--text-inverse);
	}

	.sidebar-group-btn.root.component-button-primary .sidebar-group-meta {
		color: var(--text-inverse);
	}
</style>

