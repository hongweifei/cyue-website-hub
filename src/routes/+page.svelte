<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import LayoutToggle from '$lib/components/LayoutToggle.svelte';
	import ContentArea from '$lib/components/ContentArea.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import TagList from '$lib/components/TagList.svelte';
	import { useLayout } from '$lib/hooks/useLayout';
	import { useNavigation } from '$lib/hooks/useNavigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import type { NavItem as NavItemType, NavGroup as NavGroupType } from '$lib/types';

	// 使用 Hooks 管理状态，减少耦合
	const { layoutMode, toggleLayout } = useLayout();
	const navigation = useNavigation();

	let selectedGroupId = $state<string | null>(null);
	let currentLayoutMode = $state<'sidebar' | 'vertical'>(
		browser && layoutMode ? get(layoutMode) : 'sidebar'
	);

	// 监听路由变化，确保在返回首页时重置状态
	if (browser) {
		$effect(() => {
			const currentPath = $page.url.pathname;
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
					if (mode === 'vertical') {
						selectedGroupId = null;
					}
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

	function handleLayoutToggle() {
		const currentMode = currentLayoutMode;
		toggleLayout();
		// 根据切换后的模式调整选中分组
		if (currentMode === 'sidebar') {
			selectedGroupId = null;
		} else {
			// 切换到侧边栏时，默认显示全部分组
			selectedGroupId = null;
		}
	}

	// 使用 $state 和 $effect 来响应式地订阅 stores
	let groups = $state<NavGroupType[]>(get(navigation.groups));
	let allTags = $state<string[]>(get(navigation.allTags));
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
			const unsubscribeAllTags = navigation.allTags.subscribe((value) => {
				allTags = value;
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
				unsubscribeAllTags();
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
		return groups.find((g) => g.id === selectedGroupId) || null;
	});
</script>

<div class="home-page" class:sidebar-layout={currentLayoutMode === 'sidebar'} class:vertical-layout={currentLayoutMode === 'vertical'}>
	<div class="layout-controls">
		<LayoutToggle currentMode={currentLayoutMode} onToggle={handleLayoutToggle} />
	</div>

	{#if currentLayoutMode === 'sidebar'}
		<!-- 侧边栏布局 -->
		<div class="sidebar-layout-container">
			<Sidebar
				{groups}
				{selectedGroupId}
				{allTags}
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
				<TagList
					tags={allTags}
					{selectedTags}
					onToggle={navigation.handleTagToggle}
				/>
			</div>

			<ContentArea
				{showFilteredResults}
				{filteredItems}
				currentGroup={null}
				allGroups={groups}
			/>
		</div>
	{/if}
</div>

<style>
	.home-page {
		padding: var(--spacing-md) 0;
	}

	.layout-controls {
		display: flex;
		justify-content: flex-end;
		margin-bottom: var(--spacing-lg);
	}

	/* 侧边栏布局 */
	.sidebar-layout-container {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: var(--spacing-xl);
		min-height: 600px;
	}

	/* 垂直布局 */
	.vertical-layout-container {
		width: 100%;
	}

	.search-section {
		margin-bottom: var(--spacing-xl);
	}

	.filters-section {
		margin-bottom: var(--spacing-xl);
	}

	@media (max-width: 1024px) {
		.sidebar-layout-container {
			grid-template-columns: 240px 1fr;
			gap: var(--spacing-lg);
		}
	}

	@media (max-width: 768px) {
		.home-page {
			padding: var(--spacing-sm) 0;
		}

		.layout-controls {
			margin-bottom: var(--spacing-md);
		}

		.sidebar-layout-container {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		.search-section {
			margin-bottom: var(--spacing-lg);
		}

		.filters-section {
			margin-bottom: var(--spacing-lg);
		}
	}
</style>
