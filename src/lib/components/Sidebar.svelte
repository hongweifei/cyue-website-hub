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

<aside class="sidebar">
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
			class="sidebar-group-btn root"
			class:active={selectedGroupId === null}
			onclick={() => onGroupSelect(null)}
			aria-pressed={selectedGroupId === null}
			type="button"
		>
			<span class="sidebar-group-icon root-icon" aria-hidden="true">📚</span>
			<div class="sidebar-group-content">
				<span class="sidebar-group-name">全部</span>
				<span class="sidebar-group-meta">{totalGroups} 个分组 · {totalItems} 个网站</span>
			</div>
			<span class="sidebar-group-count">{totalItems}</span>
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
		position: sticky;
		top: calc(var(--spacing-xl) + 64px);
		max-height: calc(100vh - 96px);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		padding: var(--spacing-lg);
		background: var(--bg-primary);
		border: 1px solid var(--border-light);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		overflow-x: hidden;
		overflow-y: auto;
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
		padding: var(--spacing-md);
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-light);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
	}

	.sidebar-section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
	}

	.sidebar-section-title {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.sidebar-section.filters {
		gap: var(--spacing-md);
	}

	.sidebar-section.search :global(.search-bar) {
		max-width: 100%;
		margin: 0;
	}

	.sidebar-section :global(.search-input) {
		box-shadow: none;
		border-width: 1px;
		border-radius: var(--radius-lg);
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
			padding: var(--spacing-lg);
		}
	}

	@media (max-width: 768px) {
		.sidebar {
			position: static;
			max-height: none;
			top: auto;
			padding: var(--spacing-md);
			gap: var(--spacing-md);
		}
	}

	@media (max-width: 480px) {
		.sidebar {
			padding: var(--spacing-md);
		}
	}

	.sidebar-group-btn.root {
		background: linear-gradient(
			135deg,
			var(--primary-lightest, rgba(101, 117, 255, 0.12)) 0%,
			var(--primary-light, rgba(101, 117, 255, 0.28)) 100%
		);
		border: 1px solid rgba(101, 117, 255, 0.28);
		box-shadow: var(--shadow-sm);
	}

	.sidebar-group-btn.root:hover {
		transform: translateY(-1px);
	}

	.sidebar-group-btn.root .sidebar-group-icon {
		background: rgba(255, 255, 255, 0.6);
		color: var(--primary-color);
	}

	.sidebar-group-btn.root .sidebar-group-count {
		background: rgba(255, 255, 255, 0.28);
		border-color: rgba(255, 255, 255, 0.32);
		color: var(--primary-color);
	}

	.sidebar-group-btn.root.active {
		background: linear-gradient(
			135deg,
			var(--primary-color) 0%,
			var(--accent-color, #8b5cf6) 100%
		);
		border-color: transparent;
		color: var(--text-inverse);
		box-shadow: var(--shadow-md);
	}

	.sidebar-group-btn.root.active .sidebar-group-count {
		background: rgba(255, 255, 255, 0.18);
		border-color: rgba(255, 255, 255, 0.24);
		color: var(--text-inverse);
	}

	.sidebar-group-btn.root.active .sidebar-group-meta {
		color: rgba(255, 255, 255, 0.85);
	}
</style>

