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
 */
export function useNavigation(initialData?: NavigationInitialData) {
	// 尝试从 context 获取，如果没有则创建新的
	let navigationStore = getContext<ReturnType<typeof createNavigationStore>>(NAVIGATION_CONTEXT_KEY);
	
	if (!navigationStore) {
		if (!initialData) {
			throw new Error('useNavigation must be initialized with navigation data.');
		}
		navigationStore = createNavigationStore(initialData);
		setContext(NAVIGATION_CONTEXT_KEY, navigationStore);
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

