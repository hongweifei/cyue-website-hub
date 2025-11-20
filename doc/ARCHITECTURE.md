# 项目架构文档

## 项目概述

**鸽子导航网** 是一个基于 SvelteKit 5 构建的高性能、SEO 友好的静态导航网站。项目采用现代化的前端架构，支持分组管理、搜索筛选、用户收藏、主题切换等功能。

## 技术栈

### 核心框架
- **SvelteKit 5** - 全栈框架，提供 SSR/SSG 支持
- **Svelte 5** - 响应式 UI 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速构建工具和开发服务器

### 构建与部署
- **@sveltejs/adapter-static** - 静态站点生成适配器
- **mdsvex** - Markdown 预处理器，支持在 Svelte 组件中使用 Markdown
- **marked** - Markdown 解析器

### 开发工具
- **svelte-check** - Svelte 类型检查工具
- **TypeScript** - 类型检查

## 项目结构

```
cyue-website-hub/
├── build/                 # 构建输出目录（静态文件）
├── node_modules/          # 依赖包
├── scripts/               # 工具脚本
│   └── import-csv.js      # CSV 批量导入脚本
├── src/                   # 源代码目录
│   ├── app.css            # 全局样式文件（部分基础变量，可在主题中覆盖）
│   ├── components.css     # 组件类样式定义
│   ├── app.d.ts           # TypeScript 类型声明
│   ├── app.html           # HTML 模板
│   ├── data/              # 数据目录
│   │   └── groups/        # 分组数据
│   │       ├── search/    # 搜索引擎分组
│   │       │   ├── _group.json    # 分组元数据
│   │       │   ├── baidu.json    # 单个导航项
│   │       │   ├── baidu.md      # Markdown 介绍
│   │       │   └── sites.json    # 批量导航项（数组格式）
│   │       ├── social/    # 社交网络分组
│   │       └── tools/     # 工具分组
│   ├── lib/               # 共享库代码
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # Svelte 组件
│   │   │   ├── ContentArea.svelte      # 内容展示区域
│   │   │   ├── FavoriteManager.svelte  # 收藏管理器
│   │   │   ├── LayoutToggle.svelte     # 布局切换器
│   │   │   ├── MarkdownRenderer.svelte # Markdown 渲染器
│   │   │   ├── NavGroup.svelte         # 导航分组组件
│   │   │   ├── NavItem.svelte          # 导航项组件
│   │   │   ├── SearchBar.svelte        # 搜索栏组件
│   │   │   ├── Sidebar.svelte          # 侧边栏组件
│   │   │   ├── TagList.svelte          # 标签列表组件
│   │   │   └── ThemeToggle.svelte      # 主题切换器
│   │   ├── constants.ts   # 应用常量
│   │   ├── dataLoader.ts # 数据加载器
│   │   ├── hooks/         # 自定义 Hooks
│   │   │   ├── useLayout.ts      # 布局管理 Hook
│   │   │   └── useNavigation.ts  # 导航数据管理 Hook
│   │   ├── services/      # 业务服务层
│   │   │   └── searchService.ts  # 搜索服务
│   │   ├── stores/        # 状态管理（Svelte Stores）
│   │   │   ├── favorites.ts      # 收藏状态
│   │   │   ├── layout.ts         # 布局状态
│   │   │   └── theme.ts          # 主题状态
│   │   ├── types.ts       # TypeScript 类型定义
│   │   ├── utils/         # 工具函数
│   │   │   └── icon.ts    # 图标处理工具
│   │   └── index.ts       # 库入口文件
│   └── routes/            # 路由目录（SvelteKit 文件系统路由）
│       ├── +layout.svelte # 全局布局组件
│       ├── +layout.ts     # 布局加载函数
│       ├── +layout.server.ts  # 服务端布局逻辑
│       ├── +page.svelte   # 首页
│       ├── favorites/     # 收藏页面
│       │   └── +page.svelte
│       ├── group/         # 分组页面
│       │   └── [group]/   # 动态路由：分组详情页
│       │       ├── +page.svelte
│       │       └── +page.ts
│       └── item/          # 导航项详情页
│           └── [id]/      # 动态路由：导航项详情
│               ├── +page.svelte
│               └── +page.ts
├── static/                 # 静态资源目录
│   ├── assets/
│   │   └── icons/          # 图标文件
│   └── robots.txt
├── package.json           # 项目配置和依赖
├── svelte.config.js       # Svelte 配置
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── README.md              # 项目说明文档
```

## 架构设计

### 1. 分层架构

项目采用清晰的分层架构，各层职责明确：

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  ← 路由和页面组件
│  (Routes, Page Components)          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Component Layer              │  ← 可复用 UI 组件
│  (Svelte Components)                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Business Logic Layer         │  ← Hooks 和 Services
│  (Hooks, Services)                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         State Management Layer       │  ← Svelte Stores
│  (Stores)                            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Data Layer                   │  ← 数据加载器
│  (Data Loader, File System)          │
└─────────────────────────────────────┘
```

### 2. 数据流

#### 数据加载流程

```
文件系统 (src/data/groups/)
    ↓
dataLoader.ts (使用 Vite glob import)
    ↓
缓存机制 (内存缓存)
    ↓
Stores / Hooks (状态管理)
    ↓
Components (UI 展示)
```

#### 搜索筛选流程

```
用户输入 (SearchBar)
    ↓
useNavigation Hook (状态更新)
    ↓
searchService (业务逻辑处理)
    ↓
derived Store (响应式计算)
    ↓
ContentArea (结果展示)
```

### 3. 核心模块

#### 3.1 数据加载模块 (`dataLoader.ts`)

**职责**：
- *仅在服务器端* 动态加载所有导航项数据（支持单个对象和数组格式）
- 加载分组元数据
- 加载 Markdown 内容
- 提供数据缓存机制，供 SSR/SSG 阶段复用

**关键特性**：
- 使用文件系统 API（Node.js `fs` 模块）在服务器端读取文件
- 支持 Markdown frontmatter 格式（使用 `gray-matter` 解析）
- 支持三种数据格式：
  - 单个 JSON 对象（`[id].json`）
  - JSON 数组（`sites.json`）
  - Markdown frontmatter（`[id].md`，推荐方式）
- 内存缓存机制，避免重复加载
- 自动解析并构建分组树，支持任意层级的子分组
- 避免在浏览器环境执行 Node.js 依赖（如 `gray-matter`、`fs`），所有解析逻辑在服务器端完成
- 支持相关网站推荐功能，基于标签相似度计算

**主要函数**：
- `loadAllNavItems()` - 加载所有导航项
- `loadGroups()` - 按分组组织导航项
- `loadMarkdownContent()` - 加载 Markdown 内容
- `loadGroupMetadata()` - 加载分组元数据
- `getAllTags()` - 获取所有标签
- `getTagSummaries()` - 获取标签摘要（包含标签使用统计）
- `findGroupById()` - 在分组树中查找指定分组

**分组解析流程概述**：
1. 通过 `import.meta.glob` 读取所有 `_group.json`，基于文件路径生成唯一分组ID（如 `ai/tools`）。
2. 根据目录层级自动推断父级分组，实现零配置嵌套结构（如 `ai/tools` 的父级为 `ai`）。
3. `loadGroups()` 根据导航项所属分组 ID 与 `GroupDefinition` 合并，生成包含 `children` 数组的树形结构，并按 `order` 与名称排序。
4. Markdown 内容加载会复用分组路径信息，确保子分组 Markdown 可放在对应目录下。

**重要规则**：
- 分组ID完全基于文件路径自动生成（小写路径段，用斜杠连接）
- 父子关系完全基于目录层级自动推断
- `_group.json` 中的 `id` 和 `parentId` 字段将被忽略
- 导航项数据文件中的 `group` 字段将被忽略，始终基于文件路径推断

#### 3.2 状态管理模块 (`stores/`)

**favorites.ts** - 收藏功能
- 使用 LocalStorage 持久化
- 提供 `add`, `remove`, `toggle`, `has` 方法
- 响应式状态更新

**theme.ts** - 主题管理
- 支持明暗主题切换
- 自动检测系统主题偏好
- LocalStorage 持久化

**layout.ts** - 布局管理
- 支持侧边栏和垂直两种布局模式
- LocalStorage 持久化用户偏好

#### 3.3 业务逻辑模块

**useNavigation Hook** (`hooks/useNavigation.ts`)
- 封装导航数据管理逻辑
- 使用 Svelte Context 实现单例模式
- 依赖 `+layout.server.ts` 注入的初始数据；首次调用时必须传入服务器端的导航数据
- 管理搜索、筛选、分组等状态，并提供响应式派生状态
- 客户端只在已有数据的基础上做过滤/派生，不再直接访问 `dataLoader`

**useLayout Hook** (`hooks/useLayout.ts`)
- 管理布局模式切换
- 与 layout store 集成

**searchService** (`services/searchService.ts`)
- 独立的搜索服务类
- 支持关键词搜索、分组筛选、标签筛选
- 可扩展的搜索逻辑

#### 3.4 组件模块 (`components/`)

**布局组件**：
- `Sidebar.svelte` - 侧边栏导航
- `ContentArea.svelte` - 内容展示区域
- `LayoutToggle.svelte` - 布局切换按钮

**功能组件**：
- `SearchBar.svelte` - 搜索输入框
- `TagFilterPanel.svelte` - 标签筛选面板，提供标签筛选功能
- `GroupFilterPanel.svelte` - 分组筛选面板，提供分组筛选功能
- `NavGroup.svelte` - 顶层分组容器，协调分组与子分组展示
- `NavGroupSection.svelte` - 单个分组段的递归渲染
- `NavGroupChildren.svelte` - 子分组集合包装
- `SidebarGroupTree.svelte` - 树形分组导航入口
- `SidebarGroupTreeList.svelte` / `SidebarGroupTreeItem.svelte` - 树形分组列表与节点
- `NavItem.svelte` - 单个导航项
- `SiteIcon.svelte` - 网站图标组件，支持自动获取 favicon 和占位符
- `FavoriteManager.svelte` - 通过派生 store（`derived`）组合导航数据和收藏 ID，避免循环依赖
- `RelatedRecommendations.svelte` - 相关网站推荐组件，基于标签相似度推荐相关网站
- `MarkdownRenderer.svelte` - Markdown 渲染
- `ThemeToggle.svelte` - 主题切换按钮
- `ContentArea.svelte` - 内容展示区域，统一管理内容区域的展示逻辑

#### 3.5 工具函数 (`utils/`)

**group.ts** 提供树形分组相关的纯函数：
- `countGroupItems()` - 统计分组及其子分组包含的网站数量
- `flattenGroupTree()` - 将树形结构拍平成数组，便于快速检索
- `findGroupInTree()` - 根据谓词在树中定位分组

**icon.ts** 提供图标处理相关的工具函数：
- 图标 URL 处理
- Favicon 自动获取逻辑
- 图标占位符生成

### 4. 路由设计

采用 SvelteKit 的文件系统路由：

```
/                    → 首页（所有分组展示）
/favorites           → 收藏页面
/group/[group]       → 分组详情页（动态路由）
/item/[id]           → 导航项详情页（动态路由）
```

**路由特性**：
- 支持 SSG（静态站点生成）
- 自动预渲染所有页面
- SEO 友好的 URL 结构

#### 4.1 服务端数据加载流程

- `src/routes/+layout.server.ts`
  - 构建阶段（SSG）预加载所有分组、标签和导航项，作为 `navigation` 上下文注入客户端
  - 仅在首页和收藏页加载导航数据，其他页面按需加载，优化性能
  - 加载网站配置（`config.json`）和构建时间信息
  - 客户端水合时复用该数据，不再额外请求或解析 Markdown
- `src/routes/group/[group]/+page.server.ts`
  - 按分组 ID 预渲染分组页面
  - 仅在服务器端调用 `loadGroups()`
- `src/routes/item/[id]/+page.server.ts`
  - 加载单个导航项及其 Markdown 描述
  - 生成相关网站推荐（基于标签相似度算法）
  - 避免浏览器执行 `gray-matter`

> 说明：所有 `+page.server.ts` 都导出 `entries()`，确保在静态导出时预生成所有详情页。

### 5. 数据模型

#### NavItem（导航项）
```typescript
interface NavItem {
  id: string;           // 唯一标识符
  name: string;        // 网站名称
  url: string;         // 网站 URL
  icon?: string;       // 图标路径（可选）
  info?: string;       // 简要信息（可选）
  desc_md?: string;    // Markdown 文件名（可选，仅用于 JSON 格式）
  group: string;       // 所属分组（自动推断，数据文件中可忽略）
  tags: string[];      // 标签数组
}
```

#### WebsiteConfig（网站配置）
```typescript
interface WebsiteConfig {
  domain: string;       // 网站域名
  name: string;         // 网站名称
  description?: string; // 网站描述
  icon?: string;        // 网站图标
  image?: string;       // 网站预览图
  keywords?: string;    // SEO 关键词
  locale?: string;      // 语言区域
  author?: string;      // 作者
  contactEmail?: string; // 联系邮箱
  version?: string;     // 版本号
}
```

#### TagSummary（标签摘要）
```typescript
interface TagSummary {
  name: string;         // 标签名称
  count: number;        // 使用该标签的导航项数量
  groupIds: string[];   // 包含该标签的分组 ID 列表
  groupCount: number;   // 包含该标签的分组数量
}
```

#### ItemRecommendation（推荐项）
```typescript
interface ItemRecommendation {
  item: NavItem;        // 推荐的导航项
  commonTags: string[]; // 共同标签列表
  isSameGroup: boolean; // 是否属于同一分组
}
```

#### GroupMetadata（分组元数据）
```typescript
interface GroupMetadata {
  id?: string;          // 将被忽略，始终基于路径生成唯一ID
  name: string;         // 分组名称
  description?: string; // 分组描述（可选）
  icon?: string;        // 分组图标（可选）
  order?: number;       // 排序顺序（可选）
  parentId?: string | null; // 将被忽略，始终基于路径自动推断
}
```

**注意**：`id` 和 `parentId` 字段在 `_group.json` 中可以存在，但会被系统忽略。系统会基于文件路径自动生成唯一ID（如 `ai/tools`）并推断父子关系。

#### NavGroup（导航分组）
```typescript
interface NavGroup {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  items: NavItem[];    // 该分组下的所有导航项
  parentId?: string | null; // 父级分组
  children?: NavGroup[];    // 子分组
}
```

### 6. 数据存储

#### 文件系统存储

数据以文件形式存储在 `src/data/groups/` 目录下：

**分组结构**：
```
groups/
  ├── search/
  │   ├── _group.json          # 顶级分组元数据，ID: "search"
  │   ├── sites.json           # 同级导航项（可选）
  │   └── international/       # 子分组目录（可继续嵌套）
  │       ├── _group.json      # 子分组元数据，ID: "search/international"，父级: "search"
  │       └── sites.json       # 子分组导航项
  └── social/
      └── ...
```

**数据格式示例**：

`search/_group.json`:
```json
{
  "name": "搜索引擎",
  "description": "各种搜索引擎和搜索工具",
  "order": 1
}
```
> 注意：`id` 和 `parentId` 字段将被忽略，系统会自动生成 ID `"search"`。

`search/international/_group.json`:
```json
{
  "name": "国际搜索",
  "description": "海外与多语言搜索服务",
  "order": 2
}
```
> 注意：系统会自动生成 ID `"search/international"`，并自动推断父级为 `"search"`。

`search/sites.json`:
```json
[
  {
    "id": "baidu",
    "name": "百度",
    "url": "https://www.baidu.com",
    "info": "中国最大的搜索引擎",
    "desc_md": "baidu.md",
    "tags": ["搜索", "工具"]
  }
]
```
> 注意：`group` 字段将被忽略，系统会自动推断分组为 `"search"`。

`search/international/sites.json`:
```json
[
  {
    "id": "google",
    "name": "Google",
    "url": "https://www.google.com",
    "info": "全球最大的搜索引擎",
    "desc_md": "google.md",
    "tags": ["搜索", "工具", "国际"]
  }
]
```
> 注意：系统会自动推断分组为 `"search/international"`。

**重要规则**：
- 所有分组ID基于文件路径自动生成（小写，用斜杠连接，如 `ai/tools`）
- 所有父子关系基于目录层级自动推断
- 数据文件中的 `group` 字段将被忽略，始终基于文件路径推断

#### 浏览器存储

- **LocalStorage**：
  - `nav-favorites` - 收藏的导航项 ID 列表
  - `nav-theme` - 主题偏好
  - `nav-layout-mode` - 布局模式偏好

### 7. 构建与部署

#### 构建配置

**svelte.config.js**:
- 使用 `@sveltejs/adapter-static` 适配器
- 配置 mdsvex 预处理器支持 `.md` 和 `.svx` 文件
- 启用预渲染（SSG）

**vite.config.ts**:
- 使用 SvelteKit 插件
- 支持热模块替换（HMR）
- 注入构建时间常量 `__BUILD_TIME__`，用于版本追踪

#### 构建流程

```
源代码 (src/)
    ↓
Vite 构建
    ↓
SvelteKit 编译
    ↓
静态文件生成 (build/)
    ↓
部署到静态服务器
```

#### 部署选项

- **GitHub Pages** - 静态文件托管
- **Vercel** - 自动部署
- **Netlify** - 自动部署
- **其他静态服务器** - 上传 build/ 目录

## 设计模式

### 1. 单例模式
- `useNavigation` Hook 使用 Context API 实现单例
- `searchService` 导出单例实例

### 2. 观察者模式
- Svelte Stores 实现响应式状态管理
- 组件通过 `$:` 和 `$effect` 订阅状态变化

### 3. 策略模式
- `searchService` 封装不同的搜索策略
- 可扩展的筛选逻辑

### 4. 工厂模式
- `dataLoader` 统一的数据加载接口
- 支持多种数据格式的自动识别

## 性能优化

### 1. 数据缓存
- 内存缓存机制，避免重复加载数据
- 缓存导航项、分组、标签等数据

### 2. 代码分割
- SvelteKit 自动代码分割
- 路由级别的懒加载

### 3. 静态生成
- 所有页面预渲染为静态 HTML
- 减少运行时计算

### 4. 资源优化
- 图标自动获取和缓存（使用 Google favicon 服务）
- CSS 变量实现主题切换，无需重新加载样式
- 按需加载导航数据，减少不必要的内存占用

### 5. 推荐算法
- 基于标签相似度的相关网站推荐（在 `item/[id]/+page.server.ts` 中实现）
- 使用多因素评分算法：
  - 稀有标签权重（使用频率越低的标签权重越高）
  - 共同标签数量
  - 标签重叠覆盖率
  - 同分组加分
  - 多样性惩罚（避免推荐过于相似的网站）
- 支持同分组优先推荐
- 可配置推荐数量（默认 6 个）

## 扩展性

### 添加新功能

1. **添加新组件**：
   - 在 `src/lib/components/` 创建新组件
   - 遵循 Svelte 5 的 runes 语法

2. **添加新服务**：
   - 在 `src/lib/services/` 创建服务类
   - 导出单例实例

3. **添加新 Store**：
   - 在 `src/lib/stores/` 创建 store
   - 使用 Svelte writable/readable/derived

4. **添加新路由**：
   - 在 `src/routes/` 创建对应目录结构
   - 遵循 SvelteKit 文件系统路由规则

### 数据扩展

1. **添加新分组**：
   - 在 `src/data/groups/` 创建新目录
   - 添加 `_group.json` 元数据文件

2. **添加导航项**：
   - 创建 `[id].json` 文件（单个）
   - 或在 `sites.json` 中添加（批量）

3. **批量导入**：
   - 使用 `scripts/import-csv.js` 脚本
   - 支持 CSV 格式批量导入

## 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 Svelte 5 最佳实践
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

### 组件设计原则
- 单一职责原则
- 可复用性
- Props 类型定义
- 响应式设计

### 状态管理原则
- 使用 Stores 管理全局状态
- 使用 Props 传递局部状态
- 避免过度使用 Context

## 技术亮点

1. **类型安全**：全面使用 TypeScript，提供完整的类型定义
2. **响应式设计**：支持移动端、平板、桌面端
3. **SEO 优化**：静态生成，友好的 URL 结构
4. **性能优化**：数据缓存、代码分割、静态生成
5. **用户体验**：主题切换、布局切换、收藏功能
6. **可维护性**：清晰的分层架构、模块化设计
7. **可扩展性**：灵活的数据格式、易于添加新功能

## 依赖关系图

```
src/routes/
    ↓ 使用
src/lib/components/
    ↓ 使用
src/lib/hooks/ + src/lib/stores/
    ↓ 使用
src/lib/services/
    ↓ 使用
src/lib/dataLoader.ts
    ↓ 读取
src/data/groups/
```

## 总结

本项目采用现代化的前端架构，通过清晰的分层设计、模块化组件、响应式状态管理，实现了一个高性能、可维护、可扩展的导航网站。项目充分利用了 SvelteKit 和 Svelte 5 的特性，提供了优秀的开发体验和用户体验。

