# 鸽子导航网

一个高性能、SEO友好、纯静态可部署的导航网站，支持分组、标签、搜索、收藏、内容批量管理和富文本介绍（Markdown）。

## 功能特性

- ✅ 按分组展示网站导航项
- ✅ 支持子分组与树形导航结构
- ✅ 支持按名称、标签、分组、介绍内容模糊搜索
- ✅ 标签筛选和分组筛选
- ✅ 用户收藏功能（localStorage）
- ✅ 响应式设计（手机、平板、PC）
- ✅ Markdown 富文本介绍
- ✅ 内容与结构分离，支持大量数据
- ✅ 纯静态输出，支持 SSG（静态站点生成）
- ✅ SEO 优化

## 技术栈

- **框架**: SvelteKit 5
- **Markdown解析**: mdsvex + marked
- **样式**: CSS Variables + 响应式设计
- **部署**: 静态站点（adapter-static）

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

访问 http://localhost:5173

### 构建

```bash
npm run build
```

构建产物在 `build/` 目录，可直接部署到任意静态服务器。

### 预览构建结果

```bash
npm run preview
```

## 使用说明

> **重要**：所有分组ID和父子关系都基于文件系统路径自动生成和推断，不允许显式指定。

### 添加新分组

1. 在 `src/data/groups/[分组目录名]/` 目录下创建分组元数据文件 `_group.json`：

```json
{
  "name": "开发工具",
  "description": "开发相关的工具和平台",
  "icon": "/assets/icons/tools.ico",
  "order": 1
}
```

**字段说明**：
- `name` (必需): 分组显示名称
- `description` (可选): 分组描述
- `icon` (可选): 分组图标路径
- `order` (可选): 同级排序权重，数字越小越靠前，默认为 999

**注意**：
- `id` 字段将被忽略，系统会基于目录路径自动生成唯一ID（如 `tools`、`ai/tools`）
- `parentId` 字段将被忽略，系统会基于目录层级自动推断父子关系

2. 子分组通过嵌套目录自动创建。例如：

```
src/data/groups/
└── search/
    ├── _group.json            # 顶级分组，ID: "search"
    ├── sites.json
    └── international/
        ├── _group.json        # 子分组，ID: "search/international"，自动继承 search 作为父级
        └── sites.json
```

上例中，`international/_group.json` 会自动继承 `search` 作为父级分组，分组ID为 `search/international`。

### 添加新导航项

支持三种方式添加导航项：

#### 方式一：Markdown Frontmatter（推荐，最简单）

直接在 Markdown 文件中编写元数据，无需单独的 JSON 文件。

1. 在 `src/data/groups/[分组名]/` 目录下创建 `[id].md` 文件：

```markdown
---
id: example
name: 示例网站
url: https://example.com
icon: /assets/icons/example.ico
info: 网站简介
tags:
  - 工具
  - 开发
---

这里是网站的详细介绍，支持 Markdown 格式。

**特色功能**：
- 功能一
- 功能二
```

**Frontmatter 字段说明**：
- `id` (可选): 导航项唯一标识符，如果不提供则使用文件名（不含扩展名）
- `name` (必需): 网站名称
- `url` (必需): 网站链接
- `icon` (可选): 图标路径
- `info` (可选): 简短介绍
- `tags` (可选): 标签列表，可以是数组或逗号分隔的字符串

**注意**：
- `group` 字段将被忽略，分组始终基于文件路径自动推断（如文件在 `tools/` 目录下，则属于 `tools` 分组）

**优势**：
- 一个文件包含所有信息，无需维护 JSON 和 Markdown 两个文件
- 元数据和内容在一起，更容易管理
- 如果 Markdown 和 JSON 同时存在，优先使用 Markdown frontmatter

#### 方式二：单个文件（传统方式）

1. 在 `src/data/groups/[分组名]/` 目录下创建文件：
   - `[id].json` - 单个导航项元数据
   - `[id].md` - Markdown 格式的详细介绍（可选）

2. JSON 文件示例：

```json
{
  "id": "example",
  "name": "示例网站",
  "url": "https://example.com",
  "icon": "/assets/icons/example.ico",
  "info": "网站简介",
  "desc_md": "example.md",
  "tags": ["工具", "开发"]
}
```

**注意**：
- `group` 字段将被忽略，分组始终基于文件路径自动推断（如文件在 `tools/` 目录下，则属于 `tools` 分组）

#### 方式三：批量文件（推荐用于大量网站）

1. 在 `src/data/groups/[分组名]/` 目录下创建文件：
   - `sites.json` - 包含多个导航项的数组
   - `[id].md` - 每个网站的 Markdown 介绍文件（可选）

2. JSON 文件示例（数组格式）：

```json
[
  {
    "id": "example1",
    "name": "示例网站1",
    "url": "https://example1.com",
    "info": "网站简介1",
    "desc_md": "example1.md",
    "tags": ["工具", "开发"]
  },
  {
    "id": "example2",
    "name": "示例网站2",
    "url": "https://example2.com",
    "info": "网站简介2",
    "desc_md": "example2.md",
    "tags": ["工具", "设计"]
  }
]
```

**注意**：
- `group` 字段将被忽略，分组始终基于文件路径自动推断

**注意**：
- 三种方式可以混合使用
- 同一个分组下可以同时有 Markdown frontmatter、单个文件和批量文件
- 系统会自动识别并加载所有格式
- 如果同一个 ID 在 Markdown frontmatter 和 JSON 中都存在，优先使用 Markdown frontmatter

3. **图标说明**：
   - 如果提供了 `icon` 字段，将使用指定的图标
   - 如果没有提供 `icon` 字段，系统会自动从网站 URL 获取 favicon
   - 自动获取使用 Google 的 favicon 服务，支持大部分网站
   - 如果自动获取失败，会显示网站名称的首字母作为占位符
   - 也可以手动将图标放在 `static/assets/icons/` 目录下

### 批量导入

使用 CSV 批量导入脚本：

```bash
npm run import:csv data.csv
```

CSV 格式请参考 `scripts/import-csv.js` 文件中的注释。

## 项目结构

```
src/
├── routes/              # 页面路由
│   ├── +layout.svelte   # 全局布局
│   ├── +page.svelte     # 首页
│   ├── favorites/       # 收藏页
│   └── group/[group]/   # 分组页
├── lib/
│   ├── components/      # 组件
│   │   ├── NavGroup.svelte
│   │   ├── NavGroupSection.svelte
│   │   ├── NavGroupChildren.svelte
│   │   ├── SidebarGroupTree.svelte
│   │   ├── SidebarGroupTreeList.svelte
│   │   ├── SidebarGroupTreeItem.svelte
│   │   ├── NavItem.svelte
│   │   ├── SearchBar.svelte
│   │   ├── TagList.svelte
│   │   ├── FavoriteManager.svelte
│   │   └── MarkdownRenderer.svelte
│   ├── stores/          # 状态管理
│   │   └── favorites.ts
│   ├── utils/           # 工具函数
│   │   └── group.ts
│   ├── dataLoader.ts    # 数据加载
│   └── types.ts         # 类型定义
└── data/
    └── groups/          # 导航数据
        ├── search/
        │   ├── _group.json
        │   ├── sites.json
        │   └── international/
        │       ├── _group.json
        │       └── sites.json
        ├── social/
        └── ...
```

## 内容管理

### 添加导航项

1. 在 `src/data/groups/[分组名]/` 目录下创建 JSON 和 Markdown 文件
2. JSON 文件格式：

```json
{
  "id": "unique-id",
  "name": "网站名称",
  "url": "https://example.com",
  "icon": "/assets/icons/icon.ico",
  "info": "简要信息",
  "desc_md": "description.md",
  "tags": ["标签1", "标签2"]
}
```

**注意**：`group` 字段将被忽略，分组基于文件路径自动推断。

3. Markdown 文件（可选）：用于详细介绍

### 批量导入

可以通过脚本批量导入 CSV 或其他格式的数据，转换为 JSON + Markdown 文件。

## 部署

### GitHub Pages

1. 构建项目：`npm run build`
2. 将 `build/` 目录内容推送到 `gh-pages` 分支
3. 在 GitHub 仓库设置中启用 Pages

### Vercel / Netlify

直接连接 GitHub 仓库，自动部署。

### 其他静态服务器

将 `build/` 目录内容上传到服务器即可。

## 自定义

### 修改主题颜色

编辑 `src/app.css` 中的 CSS 变量：

```css
:root {
  --primary-color: #3b82f6;
  --accent-color: #ef4444;
  /* ... */
}
```

### 添加新功能

- 组件位于 `src/lib/components/`
- 数据加载逻辑在 `src/lib/dataLoader.ts`
- 状态管理在 `src/lib/stores/`

## 许可证

MIT
