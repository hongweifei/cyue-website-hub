# 鸽子导航网

一个高性能、SEO友好、纯静态可部署的导航网站，支持分组、标签、搜索、收藏、内容批量管理和富文本介绍（Markdown）。

## 功能特性

- ✅ 按分组展示网站导航项
- ✅ 支持子分组与树形导航结构
- ✅ 支持按名称、标签、分组、介绍内容模糊搜索
- ✅ 标签筛选和分组筛选（支持面板式筛选）
- ✅ 相关网站推荐（基于标签相似度）
- ✅ 用户收藏功能（localStorage）
- ✅ 响应式设计（手机、平板、PC）
- ✅ Markdown 富文本介绍
- ✅ 内容与结构分离，支持大量数据
- ✅ 纯静态输出，支持 SSG（静态站点生成）
- ✅ SEO 优化
- ✅ 动态主题与布局系统，支持按主题切换整体排布

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

**CSV 格式说明**：

CSV 文件应包含以下列（标题行必需）：
- `id` (必需) - 唯一标识符，将作为文件名
- `name` (必需) - 网站名称
- `url` (必需) - 网站地址
- `icon` (可选) - 图标路径，如 `/assets/icons/baidu.ico`
- `info` (可选) - 简要信息
- `group` (必需) - 分组路径，支持子分组（如 `search` 或 `AI/工具`）
  - 子分组使用斜杠分隔，如 `AI/工具` 表示 AI 分组下的工具子分组
  - 分组基于文件路径自动推断，此字段仅用于确定文件存放位置
- `tags` (可选) - 标签，多个标签用逗号分隔，如 `"搜索,工具"`
- `description` (可选) - Markdown 格式的详细描述内容

**CSV 示例**：

```csv
id,name,url,icon,info,group,tags,description
baidu,百度,https://www.baidu.com,/assets/icons/baidu.ico,中国最大的搜索引擎,search,"搜索,工具","百度一下，你就知道。"
chatgpt,ChatGPT,https://chat.openai.com,,AI对话工具,AI/工具,"AI,对话","OpenAI 开发的 AI 对话工具"
```

**注意**：
- 导入的文件将使用 Markdown frontmatter 格式，不再创建单独的 JSON 文件
- 如果分组目录不存在，脚本会自动创建
- 详细格式说明请参考 `scripts/import-csv.js` 文件中的注释

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
│   │   ├── ContentArea.svelte          # 内容展示区域
│   │   ├── FavoriteManager.svelte      # 收藏管理器
│   │   ├── GroupFilterPanel.svelte     # 分组筛选面板
│   │   ├── LayoutToggle.svelte         # 布局切换器
│   │   ├── MarkdownRenderer.svelte     # Markdown 渲染器
│   │   ├── NavGroup.svelte             # 导航分组组件
│   │   ├── NavGroupSection.svelte      # 分组段组件
│   │   ├── NavGroupChildren.svelte     # 子分组集合组件
│   │   ├── NavItem.svelte              # 导航项组件
│   │   ├── RelatedRecommendations.svelte # 相关推荐组件
│   │   ├── SearchBar.svelte            # 搜索栏组件
│   │   ├── Sidebar.svelte              # 侧边栏组件
│   │   ├── SidebarGroupTree.svelte     # 侧边栏分组树
│   │   ├── SidebarGroupTreeList.svelte # 分组树列表
│   │   ├── SidebarGroupTreeItem.svelte # 分组树节点
│   │   ├── SiteIcon.svelte             # 网站图标组件
│   │   ├── TagFilterPanel.svelte       # 标签筛选面板
│   │   └── ThemeToggle.svelte          # 主题切换器
│   ├── stores/          # 状态管理
│   │   ├── favorites.ts # 收藏状态
│   │   ├── layout.ts    # 布局状态
│   │   └── theme.ts     # 主题状态
│   ├── hooks/           # 自定义 Hooks
│   │   ├── useLayout.ts      # 布局管理 Hook
│   │   └── useNavigation.ts  # 导航数据管理 Hook
│   ├── services/        # 业务服务层
│   │   └── searchService.ts  # 搜索服务
│   ├── utils/           # 工具函数
│   │   ├── group.ts     # 分组工具函数
│   │   └── icon.ts      # 图标处理工具
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

### 主题系统

主题系统提供了完全动态化、零配置的主题管理方案。系统支持自动扫描和加载主题文件，无需修改任何代码即可添加新主题。

**核心特性**：
- 零配置添加主题：只需创建 CSS 和 JSON 文件，系统自动识别
- 双轨配置：支持 CSS 变量和 JSON 配置文件，灵活组合
- 动态加载：按需加载主题 CSS，不阻塞页面初始化
- 布局驱动：主题可以控制页面布局结构，无需修改组件代码
- 组件样式系统：统一的组件样式管理，支持多变体
- 自适应模式：支持跟随系统光暗自动切换

**快速了解**：
- 主题由 `src/lib/theme/styles/*.css` 与可选的 `src/lib/theme/configs/*.json` 组成，系统会自动扫描并注册，无需改动业务代码。
- CSS 中可使用 `--theme-*` 变量声明主题元数据与样式，JSON 可补充更复杂的配置；两者自动合并，JSON 优先。
- 组件样式通过命名规范化的 CSS 变量驱动，解耦视觉与逻辑。
- 布局联动：主题可设置 `layout.tokens`（或 `--theme-layout-*` 变量），运行时会为 `<html>` 写入 `data-layout-*`，从而让顶层结构在切换主题时同步调整。

**详细文档**：
- 📖 [主题系统完整文档](./doc/THEME_SYSTEM.md) - 系统概述、架构设计、使用指南
- 📖 [CSS 变量参考文档](./doc/CSS_VARIABLES.md) - 所有 CSS 变量完整列表和说明
- 📖 [组件样式系统使用指南](./doc/COMPONENT_STYLES.md) - 组件样式系统完整文档

**重要提示**：
- `harmony.css` 是默认主题，包含所有基础样式变量的完整定义，是创建新主题的最佳参考
- `app.css` 中的基础变量（如 spacing、radius、motion 等）可以在主题中覆盖定制
- 基础样式变量分为两类：`app.css` 中的部分变量（可覆盖）和 `harmony.css` 中的完整变量定义（参考标准）

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
- 业务逻辑在 `src/lib/services/`
- 自定义 Hooks 在 `src/lib/hooks/`

## 许可证

本项目采用Apache License 2.0开源许可证。
