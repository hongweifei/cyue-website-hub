<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ContentArea from '$lib/components/ContentArea.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import TagFilterPanel from '$lib/components/TagFilterPanel.svelte';
	import GroupFilterPanel from '$lib/components/GroupFilterPanel.svelte';
	import { useLayout } from '$lib/hooks/useLayout';
	import { useNavigation } from '$lib/hooks/useNavigation';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { get } from 'svelte/store';
	import type { NavItem as NavItemType, NavGroup as NavGroupType } from '$lib/types';
	import { findGroupInTree } from '$lib/utils/group';

	// 使用 Hooks 管理状态，减少耦合
	const { layoutMode } = useLayout();
	const navigation = useNavigation();

	let selectedGroupId = $state<string | null>(null);
	let currentLayoutMode = $state<'sidebar' | 'vertical'>(
		browser && layoutMode ? get(layoutMode) : 'sidebar'
	);

	// 监听路由变化，确保在返回首页时重置状态
	if (browser) {
		$effect(() => {
			const currentPath = page.url.pathname;
			if (currentPath === '/') {
				// 返回首页时重置选中分组
				selectedGroupId = null;
			}
		});
	}

	// 订阅布局变化（仅在浏览器环境）
	if (browser) {
		$effect(() => {
			if (layoutMode && typeof layoutMode.subscribe === 'function') {
				const unsubscribe = layoutMode.subscribe((mode) => {
					currentLayoutMode = mode;
					selectedGroupId = null;
				});
				return unsubscribe;
			}
		});
	}

	function handleGroupSelect(groupId: string | null) {
		selectedGroupId = groupId;
		// 清除搜索和筛选
		navigation.clearFilters();
	}

	// 使用 $state 和 $effect 来响应式地订阅 stores
	let groups = $state<NavGroupType[]>(get(navigation.groups));
	let tagSummaries = $state(get(navigation.tagSummaries));
	let selectedTags = $state<string[]>(get(navigation.selectedTags));
	let searchQuery = $state<string>(get(navigation.searchQuery));
	let showFilteredResults = $state<boolean>(get(navigation.showFilteredResults));
	let filteredItems = $state<NavItemType[]>(get(navigation.filteredItems));

	// 订阅 stores 的变化
	if (browser) {
		$effect(() => {
			const unsubscribeGroups = navigation.groups.subscribe((value) => {
				groups = value;
			});
			const unsubscribeTagSummaries = navigation.tagSummaries.subscribe((value) => {
				tagSummaries = value;
			});
			const unsubscribeSelectedTags = navigation.selectedTags.subscribe((value) => {
				selectedTags = value;
			});
			const unsubscribeSearchQuery = navigation.searchQuery.subscribe((value) => {
				searchQuery = value;
			});
			const unsubscribeShowFilteredResults = navigation.showFilteredResults.subscribe((value) => {
				showFilteredResults = value;
			});
			const unsubscribeFilteredItems = navigation.filteredItems.subscribe((value) => {
				filteredItems = value;
			});

			return () => {
				unsubscribeGroups();
				unsubscribeTagSummaries();
				unsubscribeSelectedTags();
				unsubscribeSearchQuery();
				unsubscribeShowFilteredResults();
				unsubscribeFilteredItems();
			};
		});
	}

	// 获取当前显示的分组（null 表示显示全部）
const currentGroup = $derived.by(() => {
	if (!selectedGroupId) return null;
	return findGroupInTree(groups, (group) => group.id === selectedGroupId);
});
</script>

<div class="home-page" class:sidebar-layout={currentLayoutMode === 'sidebar'} class:vertical-layout={currentLayoutMode === 'vertical'}>
	{#if currentLayoutMode === 'sidebar'}
		<!-- 侧边栏布局 -->
		<div class="sidebar-layout-container">
			<Sidebar
				{groups}
				{selectedGroupId}
				{tagSummaries}
				{selectedTags}
				{searchQuery}
				onGroupSelect={handleGroupSelect}
				onSearch={navigation.handleSearch}
				onTagToggle={navigation.handleTagToggle}
			/>

			<ContentArea
				{showFilteredResults}
				{filteredItems}
				{currentGroup}
				allGroups={groups}
			/>
		</div>
	{:else}
		<!-- 垂直布局 -->
		<div class="vertical-layout-container">
			<div class="search-section">
				<SearchBar value={searchQuery} onInput={navigation.handleSearch} />
			</div>

			<div class="filters-section">
				<GroupFilterPanel
					{groups}
					{selectedGroupId}
					onSelect={handleGroupSelect}
					panelVariant="vertical"
				/>
				<TagFilterPanel
					tags={tagSummaries}
					{selectedTags}
					onToggle={navigation.handleTagToggle}
					{selectedGroupId}
					panelLayout="grid"
					limit={24}
				/>
			</div>

			<ContentArea
				{showFilteredResults}
				{filteredItems}
				{currentGroup}
				allGroups={groups}
			/>
		</div>
	{/if}
</div>

<style>
	.home-page {
		padding: var(--spacing-xl) 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xl);
	}

	/* 侧边栏布局 - 默认布局 */
	.sidebar-layout-container {
		display: grid;
		grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
		gap: clamp(var(--spacing-xl), 5vw, var(--spacing-2xl));
		align-items: start;
		min-height: 600px;
	}

	/* 默认布局：优化侧边栏sticky定位 */
	.sidebar-layout-container :global(.sidebar) {
		position: sticky !important;
		top: var(--spacing-lg) !important;
		max-height: calc(100vh - var(--spacing-lg) * 2) !important;
		align-self: start;
	}

	/* 垂直布局 */
	.vertical-layout-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xl);
	}

	.search-section {
		margin-bottom: var(--spacing-md);
	}

	.filters-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		align-items: stretch;
	}

	@media (min-width: 1024px) {
		.filters-section {
			display: grid;
			grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
			gap: var(--spacing-xl);
			align-items: stretch;
		}

		/* 垂直布局下，让两个筛选面板高度一致 */
		.filters-section :global(.group-filter-panel.vertical),
		.filters-section :global(.tag-filter-panel:not(.stacked)) {
			display: flex;
			flex-direction: column;
			height: 100%;
		}
	}

	@media (max-width: 1280px) {
		.sidebar-layout-container {
			grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
			gap: var(--spacing-xl);
		}
	}

	@media (max-width: 1024px) {
		.home-page {
			padding: var(--spacing-lg) 0;
		}

		.sidebar-layout-container {
			grid-template-columns: 1fr;
			gap: var(--spacing-xl);
			min-height: auto;
		}

		.sidebar-layout-container :global(.sidebar) {
			position: static;
			max-height: none;
		}

		.vertical-layout-container {
			gap: var(--spacing-xl);
		}
	}

	@media (max-width: 768px) {
		.home-page {
			padding: var(--spacing-md) 0;
			gap: var(--spacing-lg);
		}

		.sidebar-layout-container {
			grid-template-columns: 1fr !important;
			gap: var(--spacing-lg);
		}

		.search-section {
			margin-bottom: var(--spacing-md);
		}

		.filters-section {
			gap: var(--spacing-lg);
		}

		.vertical-layout-container {
			gap: var(--spacing-lg);
		}
	}
</style>
