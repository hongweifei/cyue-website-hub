import type { NavItem, NavGroup, GroupMetadata, TagSummary } from "./types";
import { searchService } from "./services/searchService";
import { DEFAULTS } from "./constants";
import matter from "gray-matter";

// 动态导入所有导航项数据（排除分组元数据文件）
// 支持单个对象或数组格式
const navItemsModules = import.meta.glob<{ default: NavItem | NavItem[] }>(
  "/src/data/groups/**/*.json",
  {
    eager: true,
  },
);

// 过滤掉分组元数据文件
const filteredNavItemsModules: Record<
  string,
  { default: NavItem | NavItem[] }
> = {};
for (const path in navItemsModules) {
  if (!path.includes("_group.json")) {
    filteredNavItemsModules[path] = navItemsModules[path];
  }
}

// 动态导入所有分组元数据文件
const groupMetadataModules = import.meta.glob<{ default: GroupMetadata }>(
  "/src/data/groups/**/_group.json",
  {
    eager: true,
  },
);

// 动态导入所有 Markdown 文件
const markdownModules = import.meta.glob<string>("/src/data/groups/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

// 缓存机制
let cachedNavItems: NavItem[] | null = null;
let cachedGroups: NavGroup[] | null = null;
let cachedTags: string[] | null = null;
let cachedTagSummaries: TagSummary[] | null = null;
let cachedGroupDefinitions: Map<string, GroupDefinition> | null = null;
let cachedGroupSegmentMap: Map<string, string> | null = null;

interface GroupDefinition extends GroupMetadata {
  pathSegments: string[];
  segmentKey: string;
}

type RawNavItem = Partial<NavItem> & {
  tags?: unknown;
  group?: string;
};

/**
 * 判断是否为数组
 */
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * 从路径中提取相对于 `/src/data/groups/` 的子路径
 */
function extractRelativeGroupPath(path: string): string | null {
  const match = path.match(/\/src\/data\/groups\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * 从数据文件路径提取分组路径片段
 */
function getGroupSegmentsFromPath(path: string): string[] {
  const relative = extractRelativeGroupPath(path);
  if (!relative) {
    return [];
  }
  const parts = relative.split("/");
  // 移除文件名
  if (parts.length > 0) {
    parts.pop();
  }
  return parts.filter((segment) => segment && segment !== ".");
}

/**
 * 从Markdown文件路径提取分组路径和ID
 */
function extractGroupAndIdFromPath(
  path: string,
): { segments: string[]; segmentKey: string; id: string } | null {
  const relative = extractRelativeGroupPath(path);
  if (!relative) {
    return null;
  }

  const parts = relative.split("/");
  if (parts.length < 2) {
    return null;
  }

  const fileName = parts.pop()!;
  const id = fileName.replace(/\.md$/, "");
  const segments = parts.filter((segment) => segment && segment !== ".");

  return {
    segments,
    segmentKey: segments.join("/"),
    id,
  };
}

/**
 * 从Markdown frontmatter创建NavItem
 */
function createNavItemFromMarkdown(
  path: string,
  content: string,
): NavItem | null {
  const parsed = matter(content);
  const metadata = parsed.data;
  const groupAndId = extractGroupAndIdFromPath(path);

  if (!groupAndId) {
    return null;
  }

  const { segmentKey, id: fallbackId } = groupAndId;

  // 从frontmatter获取元数据，如果没有则使用默认值
  const item: NavItem = {
    id: metadata.id || fallbackId,
    name: metadata.name || fallbackId,
    url: metadata.url || "",
    icon: metadata.icon || "",
    info: metadata.info || "",
    desc_md: `${fallbackId}.md`, // 保持desc_md字段用于兼容
    group: metadata.group || "", // 暂时占位，稍后统一赋值
    tags: Array.isArray(metadata.tags)
      ? metadata.tags
      : typeof metadata.tags === "string"
        ? metadata.tags.split(",").map((t) => t.trim())
        : [],
  };

  // 验证必需字段
  if (!item.name || !item.url) {
    return null;
  }

  return item;
}

/**
 * 构建分组定义映射
 */
function getGroupDefinitions(): Map<string, GroupDefinition> {
  if (cachedGroupDefinitions) {
    return cachedGroupDefinitions;
  }

  const definitions = new Map<string, GroupDefinition>();

  for (const path in groupMetadataModules) {
    const module = groupMetadataModules[path];
    if (!module?.default) continue;

    const metadata = module.default;
    const pathSegments = getGroupSegmentsFromPath(path);
    const segmentKey = pathSegments.join("/");

    const definition: GroupDefinition = {
      ...metadata,
      parentId: metadata.parentId ?? null,
      pathSegments,
      segmentKey,
    };

    definitions.set(definition.id, definition);
  }

  // 构建路径到分组ID的映射
  const segmentMap = new Map<string, string>();
  definitions.forEach((definition) => {
    if (definition.segmentKey) {
      segmentMap.set(definition.segmentKey, definition.id);
    }
  });

  // 根据路径推断父级分组（除非显式指定 parentId）
  definitions.forEach((definition) => {
    if (definition.parentId !== null && definition.parentId !== undefined) {
      if (definition.parentId === "") {
        definition.parentId = null;
      }
      return;
    }

    if (definition.pathSegments.length > 1) {
      const parentSegments = definition.pathSegments.slice(0, -1);
      const parentKey = parentSegments.join("/");
      const parentId = segmentMap.get(parentKey);
      definition.parentId = parentId ?? null;
    } else {
      definition.parentId = null;
    }
  });

  cachedGroupDefinitions = definitions;
  cachedGroupSegmentMap = segmentMap;
  return definitions;
}

function getGroupSegmentMap(): Map<string, string> {
  if (cachedGroupSegmentMap) {
    return cachedGroupSegmentMap;
  }
  getGroupDefinitions();
  return cachedGroupSegmentMap ?? new Map();
}

/**
 * 加载所有导航项数据
 * 支持三种格式：
 * 1. JSON文件中的单个对象：{ id: "...", name: "...", ... }
 * 2. JSON文件中的数组：[{ id: "...", name: "..." }, { id: "...", name: "..." }]
 * 3. Markdown文件中的frontmatter（新功能）
 *
 * 优先级：Markdown frontmatter > JSON文件
 * 如果同一个id在Markdown和JSON中都存在，优先使用Markdown
 *
 * 使用缓存机制提高性能
 */
export function loadAllNavItems(): NavItem[] {
  // 如果已缓存，直接返回
  if (cachedNavItems !== null) {
    return cachedNavItems;
  }

  const items: NavItem[] = [];
  const itemMap = new Map<string, NavItem>(); // 用于去重，key为 group:id
  const groupSegmentMap = getGroupSegmentMap();

  const deriveGroupId = (path: string, explicitGroup?: string): string => {
    if (explicitGroup && explicitGroup.trim()) {
      return explicitGroup.trim();
    }
    const segments = getGroupSegmentsFromPath(path);
    if (segments.length === 0) {
      return "";
    }
    const segmentKey = segments.join("/");
    const derived = groupSegmentMap.get(segmentKey);
    if (derived) {
      return derived;
    }
    return segments[segments.length - 1];
  };

  // 首先从JSON文件加载（作为后备）
  for (const path in filteredNavItemsModules) {
    const module = filteredNavItemsModules[path];
    if (module?.default) {
      const data = module.default;
      const jsonItems: RawNavItem[] = isArray(data)
        ? (data as RawNavItem[])
        : [data as RawNavItem];

      jsonItems.forEach((item) => {
        const normalizedGroup = deriveGroupId(path, item.group);
        if (!normalizedGroup || !item.id || !item.name || !item.url) {
          return;
        }

        const rawTags = item.tags;
        const normalizedTags = Array.isArray(rawTags)
          ? rawTags
              .map((tag) => String(tag).trim())
              .filter((tag): tag is string => tag.length > 0)
          : typeof rawTags === "string"
            ? (rawTags as string)
                .split(",")
                .map((tag: string) => tag.trim())
                .filter((tag: string) => tag.length > 0)
            : [];

        const normalizedItem: NavItem = {
          id: item.id,
          name: item.name,
          url: item.url,
          icon: item.icon,
          info: item.info,
          desc_md: item.desc_md,
          group: normalizedGroup,
          tags: normalizedTags,
        };

        const key = `${normalizedItem.group}:${normalizedItem.id}`;
        // 如果还没有从Markdown加载过，则添加
        if (!itemMap.has(key)) {
          itemMap.set(key, normalizedItem);
        }
      });
    }
  }

  // 然后从Markdown frontmatter加载（优先级更高）
  for (const path in markdownModules) {
    const content = markdownModules[path] as string;
    if (!content) continue;

    const item = createNavItemFromMarkdown(path, content);
    if (item) {
      const normalizedGroup = deriveGroupId(path, item.group);
      if (!normalizedGroup) {
        continue;
      }
      const normalizedItem: NavItem = {
        ...item,
        group: normalizedGroup,
      };
      const key = `${normalizedItem.group}:${normalizedItem.id}`;
      // Markdown优先级更高，会覆盖JSON中的同名项
      itemMap.set(key, normalizedItem);
    }
  }

  // 转换为数组
  items.push(...Array.from(itemMap.values()));

  // 缓存结果
  cachedNavItems = items;
  return items;
}

/**
 * 加载指定导航项的 Markdown 内容
 * 如果Markdown文件包含frontmatter，则只返回内容部分（排除frontmatter）
 */
export function loadMarkdownContent(item: NavItem): string {
  if (!item.desc_md) return "";

  // 构建 Markdown 文件路径
  const definitions = getGroupDefinitions();
  const definition = definitions.get(item.group);
  const groupPath =
    definition && definition.pathSegments.length > 0
      ? definition.pathSegments.join("/")
      : item.group;
  const mdPath = `/src/data/groups/${groupPath}/${item.desc_md}`;

  let rawContent = "";

  // 尝试直接匹配
  if (markdownModules[mdPath]) {
    rawContent = markdownModules[mdPath] as string;
  } else {
    // 尝试匹配完整路径
    for (const path in markdownModules) {
      if (path.includes(`${item.group}/${item.desc_md}`)) {
        rawContent = markdownModules[path] as string;
        break;
      }
    }
  }

  if (!rawContent) return "";

  // 解析frontmatter，只返回内容部分
  try {
    const parsed = matter(rawContent);
    return parsed.content.trim();
  } catch (error) {
    console.error(error);
    // 如果解析失败，尝试手动去除frontmatter
    const frontmatterRegex = /^---[\s\S]*?---\s*/;
    if (frontmatterRegex.test(rawContent)) {
      return rawContent.replace(frontmatterRegex, "").trim();
    }
  }

  return rawContent;
}

/**
 * 加载分组元数据
 */
export function loadGroupMetadata(groupId: string): GroupMetadata | null {
  const definitions = getGroupDefinitions();
  const definition = definitions.get(groupId);
  if (!definition) {
    return {
      id: groupId,
      name: groupId,
      parentId: null,
    };
  }

  const {
    pathSegments: _pathSegments,
    segmentKey: _segmentKey,
    ...metadata
  } = definition;
  return metadata;
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
  const groupItemsMap = new Map<string, NavItem[]>();

  items.forEach((item) => {
    if (!groupItemsMap.has(item.group)) {
      groupItemsMap.set(item.group, []);
    }
    groupItemsMap.get(item.group)!.push(item);
  });

  const definitions = getGroupDefinitions();
  const groupsMap = new Map<string, NavGroup>();

  const ensureGroup = (groupId: string): NavGroup => {
    if (groupsMap.has(groupId)) {
      return groupsMap.get(groupId)!;
    }

    const definition = definitions.get(groupId);
    const navGroup: NavGroup = {
      id: groupId,
      name: definition?.name || groupId,
      description: definition?.description,
      icon: definition?.icon,
      order: definition?.order ?? DEFAULTS.GROUP_ORDER,
      parentId: definition?.parentId ?? null,
      items: [],
      children: [],
    };

    groupsMap.set(groupId, navGroup);
    return navGroup;
  };

  // 先创建所有已有的分组
  definitions.forEach((definition) => {
    ensureGroup(definition.id);
  });

  // 再为仅在数据项中出现的分组创建默认分组
  groupItemsMap.forEach((_, groupId) => {
    ensureGroup(groupId);
  });

  // 赋值分组内的导航项
  groupItemsMap.forEach((groupItems, groupId) => {
    const group = ensureGroup(groupId);
    group.items = groupItems
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  });

  // 构建层级结构
  const rootGroups: NavGroup[] = [];

  groupsMap.forEach((group) => {
    if (group.parentId && groupsMap.has(group.parentId)) {
      const parent = groupsMap.get(group.parentId)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(group);
    } else {
      rootGroups.push(group);
    }
  });

  const sortGroupsRecursively = (groupList: NavGroup[]) => {
    groupList.sort((a, b) => {
      if (a.order !== b.order) {
        return (
          (a.order ?? DEFAULTS.GROUP_ORDER) - (b.order ?? DEFAULTS.GROUP_ORDER)
        );
      }
      return a.name.localeCompare(b.name, "zh-CN");
    });

    groupList.forEach((group) => {
      if (group.children && group.children.length > 0) {
        sortGroupsRecursively(group.children);
      }
    });
  };

  sortGroupsRecursively(rootGroups);

  cachedGroups = rootGroups;
  return rootGroups;
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
  return getTagSummaries().map((summary) => summary.name);
}

export function getTagSummaries(): TagSummary[] {
  if (cachedTagSummaries !== null) {
    return cachedTagSummaries;
  }

  const items = loadAllNavItems();
  const frequencyMap = new Map<string, { count: number; groupIds: Set<string> }>();

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      const normalizedTag = tag.trim();
      if (!normalizedTag) return;

      if (!frequencyMap.has(normalizedTag)) {
        frequencyMap.set(normalizedTag, { count: 0, groupIds: new Set<string>() });
      }

      const entry = frequencyMap.get(normalizedTag)!;
      entry.count += 1;
      entry.groupIds.add(item.group);
    });
  });

  const summaries: TagSummary[] = Array.from(frequencyMap.entries()).map(
    ([name, data]) => ({
      name,
      count: data.count,
      groupIds: Array.from(data.groupIds),
      groupCount: data.groupIds.size,
    }),
  );

  summaries.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.name.localeCompare(b.name, "zh-CN");
  });

  cachedTagSummaries = summaries;
  cachedTags = summaries.map((summary) => summary.name);

  return summaries;
}

/**
 * 搜索导航项
 * @deprecated 使用 searchService.search() 代替
 */
export function searchNavItems(
  items: NavItem[],
  query: string,
  group?: string,
  tags: string[] = [],
): NavItem[] {
  return searchService.search(items, {
    query,
    group,
    tags,
  });
}

/**
 * 在分组树中查找指定分组
 */
export function findGroupById(groupId: string): NavGroup | null {
  const groups = loadGroups();
  const stack: NavGroup[] = [...groups];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.id === groupId) {
      return current;
    }
    if (current.children && current.children.length > 0) {
      stack.push(...current.children);
    }
  }

  return null;
}
