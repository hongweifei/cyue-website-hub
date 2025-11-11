import type { NavItem, SearchFilters } from '../types';

/**
 * 搜索服务
 * 负责处理导航项的搜索和筛选逻辑
 * 将搜索逻辑从数据加载器中分离，提高可维护性
 */
export class SearchService {
	/**
	 * 搜索导航项
	 * @param items 要搜索的导航项列表
	 * @param filters 搜索过滤器
	 * @returns 匹配的导航项列表
	 */
	search(items: NavItem[], filters: SearchFilters): NavItem[] {
		let filtered = items;

		// 分组筛选
		if (filters.group) {
			filtered = filtered.filter((item) => item.group === filters.group);
		}

		// 标签筛选
		if (filters.tags.length > 0) {
			filtered = filtered.filter((item) =>
				filters.tags.some((tag) => item.tags.includes(tag))
			);
		}

		// 关键词搜索
		if (filters.query.trim()) {
			filtered = this.filterByQuery(filtered, filters.query);
		}

		return filtered;
	}

	/**
	 * 根据查询字符串过滤项目
	 * @param items 要过滤的项目列表
	 * @param query 查询字符串
	 * @returns 匹配的项目列表
	 */
	private filterByQuery(items: NavItem[], query: string): NavItem[] {
		const lowerQuery = query.toLowerCase().trim();
		
		return items.filter(
			(item) =>
				item.name.toLowerCase().includes(lowerQuery) ||
				item.info?.toLowerCase().includes(lowerQuery) ||
				item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
				item.group.toLowerCase().includes(lowerQuery)
		);
	}

	/**
	 * 获取所有唯一的标签
	 * @param items 导航项列表
	 * @returns 排序后的标签列表
	 */
	getAllTags(items: NavItem[]): string[] {
		const tagSet = new Set<string>();

		items.forEach((item) => {
			item.tags.forEach((tag) => tagSet.add(tag));
		});

		return Array.from(tagSet).sort();
	}
}

// 导出单例实例
export const searchService = new SearchService();

