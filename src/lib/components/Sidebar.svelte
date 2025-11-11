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
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<h2 class="sidebar-title">分组</h2>
	</div>
	<div class="sidebar-search">
		<SearchBar value={searchQuery} onInput={onSearch} />
	</div>
	<div class="sidebar-filters">
		<TagList tags={allTags} {selectedTags} onToggle={onTagToggle} />
	</div>
	<nav class="sidebar-nav">
		<button
			class="sidebar-group-btn"
			class:active={selectedGroupId === null}
			onclick={() => onGroupSelect(null)}
		>
			<span class="sidebar-group-icon all-groups-icon">📁</span>
			<span class="sidebar-group-name">全部分组</span>
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
		background: var(--card-bg);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		box-shadow: var(--shadow-md);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		height: fit-content;
		position: sticky;
		top: calc(var(--spacing-xl) + 80px);
		max-height: calc(100vh - 120px);
		overflow-y: auto;
		overflow-x: hidden;
	}

	/* 自定义滚动条样式 */
	.sidebar::-webkit-scrollbar {
		width: 6px;
	}

	.sidebar::-webkit-scrollbar-track {
		background: var(--bg-tertiary);
		border-radius: var(--radius-sm);
	}

	.sidebar::-webkit-scrollbar-thumb {
		background: var(--text-tertiary);
		border-radius: var(--radius-sm);
		transition: background var(--transition-base);
	}

	.sidebar::-webkit-scrollbar-thumb:hover {
		background: var(--primary-color);
	}

	.sidebar-header {
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-md);
		border-bottom: 2px solid var(--border-light);
	}

	.sidebar-title {
		font-size: 1.25rem;
		font-weight: 800;
		margin: 0;
		background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.sidebar-search {
		margin-bottom: var(--spacing-md);
	}

	.sidebar-filters {
		margin-bottom: var(--spacing-lg);
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.sidebar-group-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--bg-tertiary);
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-base);
		text-align: left;
		width: 100%;
		position: relative;
	}

	.sidebar-group-btn:hover {
		background: var(--primary-light);
		border-color: var(--primary-color);
		color: var(--primary-color);
		transform: translateX(4px);
	}

	.sidebar-group-btn.active {
		background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
		color: var(--text-inverse);
		border-color: transparent;
		box-shadow: var(--shadow-md);
	}

	.sidebar-group-icon {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
		object-fit: cover;
	}

	.all-groups-icon {
		font-size: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--primary-light);
	}

	.sidebar-group-btn.active .all-groups-icon {
		background: rgba(255, 255, 255, 0.2);
	}

	.sidebar-group-name {
		flex: 1;
		text-align: left;
	}

	.sidebar-group-count {
		font-size: 0.75rem;
		opacity: 0.7;
		background: rgba(0, 0, 0, 0.1);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
	}

	.sidebar-group-btn.active .sidebar-group-count {
		background: rgba(255, 255, 255, 0.3);
	}

	@media (max-width: 768px) {
		.sidebar {
			position: static;
			max-height: none;
			top: auto;
		}

		.sidebar-nav {
			display: flex;
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.sidebar-group-btn {
			flex-direction: row;
			text-align: left;
			padding: var(--spacing-sm) var(--spacing-md);
			min-height: auto;
		}

		.sidebar-group-icon,
		.all-groups-icon {
			width: 28px;
			height: 28px;
		}

		.sidebar-group-name {
			font-size: 0.875rem;
			margin-top: 0;
		}

		.sidebar-group-count {
			position: static;
			font-size: 0.75rem;
			padding: var(--spacing-2xs) var(--spacing-xs);
		}
	}

	@media (max-width: 480px) {
		.sidebar {
			padding: var(--spacing-md);
		}

		.sidebar-group-btn {
			font-size: 0.875rem;
			padding: var(--spacing-xs) var(--spacing-sm);
		}
	}
</style>

