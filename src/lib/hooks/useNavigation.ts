import { searchService } from '../services/searchService';
import type { NavItem, NavGroup, TagSummary } from '../types';
import { getContext, setContext } from 'svelte';
import { writable, derived, type Writable, type Readable } from 'svelte/store';
import { browser } from '$app/environment';

// ==================== 常量定义 ====================

/** Context 键，用于在组件树中共享导航状态 */
const NAVIGATION_CONTEXT_KEY = Symbol('navigation');

/** 搜索防抖延迟时间（毫秒） */
const SEARCH_DEBOUNCE_DELAY = 60;

// ==================== 类型定义 ====================

/**
 * 导航初始数据接口
 */
export interface NavigationInitialData {
	groups: NavGroup[];
	tags: string[];
	tagSummaries: TagSummary[];
	navItems: NavItem[];
}

/**
 * 导航 Store 返回类型
 */
export interface NavigationStore {
	/** 导航分组列表 */
	groups: Writable<NavGroup[]>;
	/** 所有标签列表 */
	allTags: Writable<string[]>;
	/** 标签摘要列表 */
	tagSummaries: Writable<TagSummary[]>;
	/** 所有导航项列表 */
	navItems: Writable<NavItem[]>;
	/** 搜索查询字符串 */
	searchQuery: Writable<string>;
	/** 选中的标签列表 */
	selectedTags: Writable<string[]>;
	/** 过滤后的导航项（只读） */
	filteredItems: Readable<NavItem[]>;
	/** 是否显示过滤结果（只读） */
	showFilteredResults: Readable<boolean>;
	/** 处理搜索输入 */
	handleSearch: (value: string) => void;
	/** 切换标签选中状态 */
	handleTagToggle: (tag: string) => void;
	/** 清除所有过滤条件 */
	clearFilters: () => void;
	/** 更新导航数据 */
	updateData: (data: NavigationInitialData) => void;
	/** 清理资源（用于组件卸载时） */
	destroy: () => void;
}

// ==================== 工具函数 ====================

/**
 * 创建空的导航初始数据
 */
function createEmptyNavigationData(): NavigationInitialData {
	return {
		groups: [],
		tags: [],
		tagSummaries: [],
		navItems: []
	};
}

/**
 * 导航数据管理 Hook
 * 
 * 封装导航数据的加载、搜索和筛选逻辑，使用 Svelte Context 在组件树中共享状态。
 * 支持防抖搜索、标签筛选等功能。
 * 
 * @param initialData - 可选的初始导航数据。如果未提供，将创建一个空状态
 * @returns 导航 Store 对象，包含所有状态和方法
 * 
 * @example
 * ```ts
 * // 在组件中使用
 * const navigation = useNavigation(data.navigation);
 * 
 * // 使用搜索功能
 * navigation.handleSearch('搜索关键词');
 * 
 * // 切换标签
 * navigation.handleTagToggle('标签名');
 * 
 * // 清除过滤
 * navigation.clearFilters();
 * ```
 */
export function useNavigation(initialData?: NavigationInitialData | null): NavigationStore {
	// 尝试从 context 获取已存在的 store
	let navigationStore = getContext<NavigationStore>(NAVIGATION_CONTEXT_KEY);
	
	if (!navigationStore) {
		// 如果没有找到，创建新的 store
		const data = initialData || createEmptyNavigationData();
		navigationStore = createNavigationStore(data);
		setContext(NAVIGATION_CONTEXT_KEY, navigationStore);
	} else if (initialData) {
		// 如果已有 store 但提供了新数据，更新 store
		navigationStore.updateData(initialData);
	}

	return navigationStore;
}

/**
 * 创建导航 Store
 * 
 * 内部函数，用于创建导航状态管理的 store 实例。
 * 包含所有状态、计算属性和操作方法。
 * 
 * @param initialData - 初始导航数据
 * @returns 导航 Store 对象
 */
function createNavigationStore(initialData: NavigationInitialData): NavigationStore {
	// ==================== 状态定义 ====================
	
	const groups = writable<NavGroup[]>(initialData.groups);
	const allTags = writable<string[]>(initialData.tags);
	const tagSummaries = writable<TagSummary[]>(initialData.tagSummaries);
	const navItems = writable<NavItem[]>(initialData.navItems);
	const searchQuery = writable<string>('');
	const selectedTags = writable<string[]>([]);
	
	// 防抖定时器 ID（用于清理）
	let searchDebounceId: ReturnType<typeof setTimeout> | null = null;

	// ==================== 计算属性 ====================

	/**
	 * 过滤后的导航项
	 * 当有搜索查询或选中标签时，返回匹配的导航项；否则返回空数组
	 */
	const filteredItems = derived(
		[searchQuery, selectedTags, navItems],
		([$searchQuery, $selectedTags, $navItems]) => {
			const trimmedQuery = $searchQuery.trim();
			const hasQuery = trimmedQuery.length > 0;
			const hasTags = $selectedTags.length > 0;
			const hasFilters = hasQuery || hasTags;

			// 如果没有过滤条件，返回空数组（不显示结果）
			if (!hasFilters) {
				return [];
			}

			// 执行搜索
			return searchService.search($navItems, {
				query: trimmedQuery,
				tags: $selectedTags
			});
		}
	);

	/**
	 * 是否显示过滤结果
	 * 当有搜索查询或选中标签时返回 true
	 */
	const showFilteredResults = derived(
		[searchQuery, selectedTags],
		([$searchQuery, $selectedTags]) => {
			return $searchQuery.trim().length > 0 || $selectedTags.length > 0;
		}
	);

	// ==================== 操作方法 ====================

	/**
	 * 处理搜索输入
	 * 在浏览器环境中使用防抖，减少不必要的搜索计算
	 * 
	 * @param value - 搜索关键词
	 */
	function handleSearch(value: string): void {
		if (!browser) {
			// SSR 环境直接设置，不使用防抖
			searchQuery.set(value);
			return;
		}

		// 清除之前的定时器
		if (searchDebounceId !== null) {
			clearTimeout(searchDebounceId);
		}

		// 设置新的防抖定时器
		searchDebounceId = setTimeout(() => {
			searchQuery.set(value);
			searchDebounceId = null;
		}, SEARCH_DEBOUNCE_DELAY);
	}

	/**
	 * 切换标签选中状态
	 * 如果标签已选中则取消，否则添加
	 * 
	 * @param tag - 要切换的标签名
	 */
	function handleTagToggle(tag: string): void {
		if (!browser) {
			return;
		}

		selectedTags.update((tags) => {
			const normalizedTag = tag.trim();
			if (!normalizedTag) {
				return tags;
			}

			const index = tags.indexOf(normalizedTag);
			if (index >= 0) {
				// 移除标签
				return tags.filter((t) => t !== normalizedTag);
			} else {
				// 添加标签
				return [...tags, normalizedTag];
			}
		});
	}

	/**
	 * 清除所有过滤条件
	 * 包括搜索查询和选中的标签，并清理防抖定时器
	 */
	function clearFilters(): void {
		if (!browser) {
			return;
		}

		// 清理防抖定时器
		if (searchDebounceId !== null) {
			clearTimeout(searchDebounceId);
			searchDebounceId = null;
		}

		// 重置状态
		searchQuery.set('');
		selectedTags.set([]);
	}

	/**
	 * 更新导航数据
	 * 用于在导航到需要数据的页面时更新 store
	 * 
	 * @param data - 新的导航数据
	 */
	function updateData(data: NavigationInitialData): void {
		groups.set(data.groups);
		allTags.set(data.tags);
		tagSummaries.set(data.tagSummaries);
		navItems.set(data.navItems);
	}

	/**
	 * 清理资源
	 * 在组件卸载时调用，防止内存泄漏
	 */
	function destroy(): void {
		if (searchDebounceId !== null) {
			clearTimeout(searchDebounceId);
			searchDebounceId = null;
		}
	}

	// ==================== 返回 Store 对象 ====================

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
		clearFilters,
		updateData,
		destroy
	};
}

