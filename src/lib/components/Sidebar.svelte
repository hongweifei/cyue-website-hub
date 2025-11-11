<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import SearchBar from './SearchBar.svelte';
	import TagList from './TagList.svelte';
	import SidebarGroupTree from './SidebarGroupTree.svelte';
	import { countGroupItems } from '../utils/group';

	interface Props {
		groups: NavGroupType[];
		selectedGroupId: string | null;
		allTags: string[];
		selectedTags: string[];
		searchQuery: string;
		onGroupSelect: (groupId: string | null) => void;
		onSearch: (value: string) => void;
		onTagToggle: (tag: string) => void;
	}

	let {
		groups,
		selectedGroupId,
		allTags,
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
		<div class="sidebar-section-header">
			<h3 class="sidebar-section-title">标签筛选</h3>
			<span class="sidebar-section-subtitle">{allTags.length} 个标签</span>
		</div>
		<TagList tags={allTags} {selectedTags} onToggle={onTagToggle} />
	</div>
	<nav class="sidebar-nav">
		<!-- TODO 使用 TreeItem 替代 -->
		<!-- <button
			class="sidebar-group-btn root"
			class:active={selectedGroupId === null}
			onclick={() => onGroupSelect(null)}
		>
			<span class="sidebar-group-icon">📁</span>
			<div class="sidebar-group-content">
				<span class="sidebar-group-name">全部分组</span>
				<span class="sidebar-group-meta">{totalGroups} 个分组 · {totalItems} 个网站</span>
			</div>
			<span class="sidebar-group-count">浏览全部</span>
		</button> -->
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

	.sidebar-section-subtitle {
		font-size: 0.75rem;
		color: var(--text-tertiary);
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
</style>

