import type { NavItem, SearchFilters } from "../types";

interface NormalizedItem {
  key: string;
  snapshot: string;
  groupId: string;
  tagSet: Set<string>;
  searchText: string;
}

/**
 * 搜索服务
 * 负责处理导航项的搜索和筛选逻辑
 * 将搜索逻辑从数据加载器中分离，提高可维护性
 */
export class SearchService {
  private normalizedCache = new Map<NavItem, NormalizedItem>();
  private keyCache = new Map<string, NormalizedItem>();
  private tagsCache = new Map<string, string[]>();

  /**
   * 搜索导航项
   * @param items 要搜索的导航项列表
   * @param filters 搜索过滤器
   * @returns 匹配的导航项列表
   */
  search(items: NavItem[], filters: SearchFilters): NavItem[] {
    if (!items.length) return [];

    const targetGroup = filters.group?.trim() ?? "";
    const hasGroup = targetGroup.length > 0;

    const tagFilters = 
      filters.tags && filters.tags.length > 0
        ? this.buildTagSet(filters.tags)
        : null;

    const queryTokens = this.tokenize(filters.query);
    const hasQuery = queryTokens.length > 0;

    // 如果没有任何筛选条件，直接返回原数组以避免不必要的创建
    if (!hasGroup && !tagFilters && !hasQuery) {
      return items;
    }

    // 预计算匹配条件，减少循环中的计算量
    const matchAllTags = tagFilters ? Array.from(tagFilters) : [];
    const matchAllTokens = queryTokens;

    const results: NavItem[] = [];

    for (const item of items) {
      const normalized = this.getNormalized(item);
      if (!normalized) continue;

      // 分组匹配
      if (hasGroup && normalized.groupId !== targetGroup) {
        continue;
      }

      // 标签匹配优化：使用 Set.has 方法，O(1) 时间复杂度
      if (matchAllTags.length > 0) {
        let hasMatchingTag = false;
        for (const tag of matchAllTags) {
          if (normalized.tagSet.has(tag)) {
            hasMatchingTag = true;
            break;
          }
        }
        if (!hasMatchingTag) {
          continue;
        }
      }

      // 查询匹配优化：使用 indexOf 代替 includes，性能更优
      if (matchAllTokens.length > 0) {
        const text = normalized.searchText;
        let matchesAllTokens = true;
        for (const token of matchAllTokens) {
          if (text.indexOf(token) === -1) {
            matchesAllTokens = false;
            break;
          }
        }
        if (!matchesAllTokens) {
          continue;
        }
      }

      results.push(item);
    }

    return results;
  }

  /**
   * 获取所有唯一的标签
   * @param items 导航项列表
   * @returns 排序后的标签列表
   */
  getAllTags(items: NavItem[]): string[] {
    // 生成缓存键
    const cacheKey = items.length > 0 ? `${items[0].id}-${items.length}` : "empty";
    
    // 检查缓存
    if (this.tagsCache.has(cacheKey)) {
      return this.tagsCache.get(cacheKey)!;
    }

    const tagSet = new Set<string>();

    // 优化：使用 for 循环代替 forEach，性能更优
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      for (let j = 0; j < item.tags.length; j++) {
        tagSet.add(item.tags[j]);
      }
    }

    const tags = Array.from(tagSet).sort();
    
    // 缓存结果
    this.tagsCache.set(cacheKey, tags);
    
    return tags;
  }

  private buildTagSet(tags: string[]): Set<string> {
    const set = new Set<string>();
    for (const tag of tags) {
      const normalized = tag.trim().toLowerCase();
      if (normalized) {
        set.add(normalized);
      }
    }
    return set;
  }

  private tokenize(rawQuery: string | undefined): string[] {
    if (!rawQuery) return [];
    return rawQuery
      .toLowerCase()
      .split(/[\s,，。；;]+/)
      .map((token) => token.trim())
      .filter(Boolean);
  }

  private getNormalized(item: NavItem): NormalizedItem | null {
    const existing = this.normalizedCache.get(item);
    const snapshot = this.createSnapshot(item);

    if (existing && existing.snapshot === snapshot) {
      return existing;
    }

    const key = this.createKey(item);
    const fallback = existing ?? this.keyCache.get(key);
    if (fallback && fallback.snapshot === snapshot) {
      this.normalizedCache.set(item, fallback);
      return fallback;
    }

    const normalized = this.createNormalized(item, key, snapshot);
    if (!normalized) return null;

    this.normalizedCache.set(item, normalized);
    this.keyCache.set(key, normalized);
    return normalized;
  }

  private createNormalized(
    item: NavItem,
    key: string,
    snapshot: string,
  ): NormalizedItem | null {
    const tagsLower = item.tags.map((tag) => tag.trim().toLowerCase());
    const searchSegments = [
      item.name,
      item.info,
      item.url,
      item.group,
      ...item.tags.map((tag) => tag.trim()),
    ]
      .filter(Boolean)
      .map((segment) => segment!.toLowerCase());

    return {
      key,
      snapshot,
      groupId: item.group,
      tagSet: new Set(tagsLower),
      searchText: searchSegments.join(" "),
    };
  }

  private createSnapshot(item: NavItem): string {
    return [
      item.id,
      item.group,
      item.name,
      item.info ?? "",
      item.url,
      item.tags.join("|"),
    ].join("¶");
  }

  private createKey(item: NavItem): string {
    return `${item.group}::${item.id}`;
  }

  private matchTags(
    normalized: NormalizedItem,
    tagFilters: Set<string>,
  ): boolean {
    for (const tag of tagFilters) {
      if (normalized.tagSet.has(tag)) {
        return true;
      }
    }
    return false;
  }

  private matchQuery(
    normalized: NormalizedItem,
    queryTokens: string[],
  ): boolean {
    if (!queryTokens.length) return true;
    const text = normalized.searchText;
    for (const token of queryTokens) {
      if (!text.includes(token)) {
        return false;
      }
    }
    return true;
  }
}

// 导出单例实例
export const searchService = new SearchService();

