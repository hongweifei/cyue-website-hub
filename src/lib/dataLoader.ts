import type { NavItem, NavGroup, GroupMetadata } from './types';
import { searchService } from './services/searchService';
import { DEFAULTS } from './constants';

// 动态导入所有导航项数据（排除分组元数据文件）
// 支持单个对象或数组格式
const navItemsModules = import.meta.glob<{ default: NavItem | NavItem[] }>(
	'/src/data/groups/**/*.json',
	{
		eager: true
	}
);

// 过滤掉分组元数据文件
const filteredNavItemsModules: Record<string, { default: NavItem | NavItem[] }> = {};
for (const path in navItemsModules) {
	if (!path.includes('_group.json')) {
		filteredNavItemsModules[path] = navItemsModules[path];
	}
}

// 动态导入所有分组元数据文件
const groupMetadataModules = import.meta.glob<{ default: GroupMetadata }>(
	'/src/data/groups/**/_group.json',
	{
		eager: true
	}
);

// 动态导入所有 Markdown 文件
const markdownModules = import.meta.glob<string>('/src/data/groups/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

// 缓存机制
let cachedNavItems: NavItem[] | null = null;
let cachedGroups: NavGroup[] | null = null;
let cachedTags: string[] | null = null;

/**
 * 判断是否为数组
 */
function isArray(value: unknown): value is unknown[] {
	return Array.isArray(value);
}

/**
 * 加载所有导航项数据
 * 支持两种格式：
 * 1. 单个对象：{ id: "...", name: "...", ... }
 * 2. 数组：[{ id: "...", name: "..." }, { id: "...", name: "..." }]
 * 
 * 使用缓存机制提高性能
 */
export function loadAllNavItems(): NavItem[] {
	// 如果已缓存，直接返回
	if (cachedNavItems !== null) {
		return cachedNavItems;
	}

	const items: NavItem[] = [];

	for (const path in filteredNavItemsModules) {
		const module = filteredNavItemsModules[path];
		if (module?.default) {
			const data = module.default;

			// 如果是数组，展开所有项
			if (isArray(data)) {
				items.push(...(data as NavItem[]));
			} else {
				// 如果是单个对象，直接添加
				items.push(data as NavItem);
			}
		}
	}

	// 缓存结果
	cachedNavItems = items;
	return items;
}

/**
 * 加载指定导航项的 Markdown 内容
 */
export function loadMarkdownContent(item: NavItem): string {
	if (!item.desc_md) return '';

	// 构建 Markdown 文件路径
	const mdPath = `/src/data/groups/${item.group}/${item.desc_md}`;

	// 尝试直接匹配
	if (markdownModules[mdPath]) {
		return markdownModules[mdPath] as string;
	}

	// 尝试匹配完整路径
	for (const path in markdownModules) {
		if (path.includes(`${item.group}/${item.desc_md}`)) {
			return markdownModules[path] as string;
		}
	}

	return '';
}

/**
 * 加载分组元数据
 */
export function loadGroupMetadata(groupId: string): GroupMetadata | null {
	// 尝试加载分组元数据文件
	for (const path in groupMetadataModules) {
		const module = groupMetadataModules[path];
		if (module?.default && module.default.id === groupId) {
			return module.default;
		}
		// 也支持通过路径匹配
		if (path.includes(`/${groupId}/_group.json`)) {
			return module?.default || null;
		}
	}
	return null;
}

/**
 * 按分组组织导航项
 * 使用缓存机制提高性能
 */
export function loadGroups(): NavGroup[] {
	// 如果已缓存，直接返回
	if (cachedGroups !== null) {
		return cachedGroups;
	}

	const items = loadAllNavItems();
	const groupMap = new Map<string, NavItem[]>();

	// 按分组归类
	items.forEach((item) => {
		if (!groupMap.has(item.group)) {
			groupMap.set(item.group, []);
		}
		groupMap.get(item.group)!.push(item);
	});

	// 转换为数组并加载元数据
	const groups: NavGroup[] = Array.from(groupMap.entries())
		.map(([groupId, items]) => {
			// 加载分组元数据
			const metadata = loadGroupMetadata(groupId);

			// 合并元数据和默认值
			return {
				id: groupId,
				name: metadata?.name || groupId,
				description: metadata?.description,
				icon: metadata?.icon,
				order: metadata?.order ?? DEFAULTS.GROUP_ORDER,
				items: items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
			};
		})
		.sort((a, b) => {
			// 先按 order 排序，再按名称排序
			if (a.order !== b.order) {
				return a.order - b.order;
			}
			return a.name.localeCompare(b.name, 'zh-CN');
		});

	// 缓存结果
	cachedGroups = groups;
	return groups;
}

/**
 * 获取所有标签
 * 使用缓存机制提高性能
 */
export function getAllTags(): string[] {
	// 如果已缓存，直接返回
	if (cachedTags !== null) {
		return cachedTags;
	}

	const items = loadAllNavItems();
	const tags = searchService.getAllTags(items);
	
	// 缓存结果
	cachedTags = tags;
	return tags;
}

/**
 * 搜索导航项
 * @deprecated 使用 searchService.search() 代替
 */
export function searchNavItems(
	items: NavItem[],
	query: string,
	group?: string,
	tags: string[] = []
): NavItem[] {
	return searchService.search(items, {
		query,
		group,
		tags
	});
}

