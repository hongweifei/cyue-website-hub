import { searchService } from '../services/searchService';
import type { NavItem, NavGroup, TagSummary } from '../types';
import { getContext, setContext } from 'svelte';
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

const NAVIGATION_CONTEXT_KEY = Symbol('navigation');

type NavigationInitialData = {
	groups: NavGroup[];
	tags: string[];
	tagSummaries: TagSummary[];
	navItems: NavItem[];
};

/**
 * 导航数据管理 Hook
 * 封装数据加载和搜索逻辑
 * 注意：必须在 Svelte 组件中使用
 * 
 * @param initialData - 可选的初始导航数据。如果未提供，将创建一个空状态
 */
export function useNavigation(initialData?: NavigationInitialData | null) {
	// 尝试从 context 获取，如果没有则创建新的
	let navigationStore = getContext<ReturnType<typeof createNavigationStore>>(NAVIGATION_CONTEXT_KEY);
	
	if (!navigationStore) {
		// 如果没有提供初始数据，创建一个空状态（用于不需要导航数据的页面）
		const emptyData: NavigationInitialData = {
			groups: [],
			tags: [],
			tagSummaries: [],
			navItems: []
		};
		navigationStore = createNavigationStore(initialData || emptyData);
		setContext(NAVIGATION_CONTEXT_KEY, navigationStore);
	} else if (initialData) {
		// 如果已有 store 但提供了新数据，更新 store（用于导航到需要数据的页面时）
		navigationStore.groups.set(initialData.groups);
		navigationStore.allTags.set(initialData.tags);
		navigationStore.tagSummaries.set(initialData.tagSummaries);
		navigationStore.navItems.set(initialData.navItems);
	}

	return navigationStore;
}

function createNavigationStore(initialData: NavigationInitialData) {
	const initialGroups = initialData.groups;
	const initialTags = initialData.tags;
	const initialTagSummaries = initialData.tagSummaries;
	const initialItems = initialData.navItems;

	const groups = writable<NavGroup[]>(initialGroups);
	const allTags = writable<string[]>(initialTags);
	const tagSummaries = writable<TagSummary[]>(initialTagSummaries);
	const navItems = writable<NavItem[]>(initialItems);
	const searchQuery = writable('');
	const selectedTags = writable<string[]>([]);
	
	const filteredItems = derived(
		[searchQuery, selectedTags, navItems],
		([$searchQuery, $selectedTags, $navItems]) => {
			const hasFilters = $searchQuery.trim() !== '' || $selectedTags.length > 0;
			if (!hasFilters) return [];
			return searchService.search($navItems, {
				query: $searchQuery,
				tags: $selectedTags
			});
		}
	);

	const showFilteredResults = derived(
		[searchQuery, selectedTags],
		([$searchQuery, $selectedTags]) => {
			return $searchQuery.trim() !== '' || $selectedTags.length > 0;
		}
	);

	function handleSearch(value: string) {
		if (browser) {
			searchQuery.set(value);
		}
	}

	function handleTagToggle(tag: string) {
		if (browser) {
			selectedTags.update((tags) => {
				if (tags.includes(tag)) {
					return tags.filter((t) => t !== tag);
				} else {
					return [...tags, tag];
				}
			});
		}
	}

	function clearFilters() {
		if (browser) {
			searchQuery.set('');
			selectedTags.set([]);
		}
	}

	return {
		groups,
		allTags,
		tagSummaries,
		navItems,
		searchQuery,
		selectedTags,
		filteredItems,
		showFilteredResults,
		handleSearch,
		handleTagToggle,
		clearFilters
	};
}

