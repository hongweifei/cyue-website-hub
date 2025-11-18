# 动态主题系统使用指南

## 概述

主题系统已完全动态化，支持自动扫描和加载主题CSS文件和配置文件。添加新主题只需两步：

1. 在 `styles/` 目录下创建CSS文件
2. 在 `configs/` 目录下创建JSON配置文件

**无需修改任何代码文件！**

## 添加新主题

### 步骤1：创建主题CSS文件

在 `src/lib/theme/styles/` 目录下创建新的CSS文件，文件名格式为 `{themeId}.css`。

例如，要添加一个名为 `ocean` 的主题：

```css
/* src/lib/theme/styles/ocean.css */
:root[data-theme="ocean"] {
	color-scheme: light;
	
	/* 主题元数据（可选，也可以通过 JSON 配置） */
	--theme-label: "海洋蓝调";
	--theme-description: "清新海洋风格";
	--theme-mode: light;
	--theme-family: glass;
	--theme-order: 20;
	--theme-badge: "推荐";
	--theme-preview-background: linear-gradient(135deg, #e0f2fe, #bae6fd);
	--theme-preview-accent: linear-gradient(120deg, #0ea5e9, #0284c7);
	--theme-preview-border: rgba(14,165,233,.25);
	--theme-features: "清新配色,海洋风格";
	
	/* 主题样式变量 */
	--primary-color: #0ea5e9;
	--primary-color-strong: #0284c7;
	/* ... 其他CSS变量 ... */
}
```

**注意**：主题元数据可以通过 CSS 变量或 JSON 配置文件提供，也可以两者结合使用。如果两者都存在，JSON 配置优先。

### 步骤2：创建主题配置文件（可选）

在 `src/lib/theme/configs/` 目录下创建JSON配置文件，文件名格式为 `{themeId}.json`。

**注意**：如果已经在 CSS 文件中通过 CSS 变量定义了主题元数据（`--theme-*`），并且提供了必需的字段（`label` 和 `mode`），则可以跳过此步骤。

例如，创建 `ocean.json`：

```json
{
	"id": "ocean",
	"label": "海洋蓝调",
	"description": "清新海洋风格",
	"mode": "light",
	"family": "glass",
	"order": 20,
	"preview": {
		"background": "linear-gradient(135deg, #e0f2fe, #bae6fd)",
		"accent": "linear-gradient(120deg, #0ea5e9, #0284c7)",
		"border": "rgba(14,165,233,.25)"
	},
	"features": ["清新配色", "海洋风格"]
}
```

**配置优先级**：
- 如果同时存在 CSS 变量和 JSON 配置，**JSON 配置优先**
- 如果只有 CSS 变量，系统会从 CSS 变量中提取元数据
- 如果只有 JSON 配置，系统会使用 JSON 配置

**完成！** 系统会自动：
- 扫描并识别新的CSS文件
- 从 CSS 变量中提取主题元数据（如果存在）
- 加载JSON配置文件（如果存在）
- 合并 CSS 和 JSON 配置（JSON 优先）
- 在开发环境下验证配置与CSS文件的同步
- 自动添加到主题列表中（按 `order` 字段排序）

## 工作原理

1. **自动扫描CSS文件**：系统使用 `import.meta.glob` 自动扫描 `styles/` 目录下的所有CSS文件
2. **提取CSS元数据**：系统从 CSS 文件中解析 `--theme-*` 变量，提取主题元数据
3. **自动扫描配置文件**：系统使用 `import.meta.glob` 自动扫描 `configs/` 目录下的所有JSON配置文件
4. **配置合并**：系统合并 CSS 元数据和 JSON 配置（JSON 优先）
5. **动态加载**：主题CSS文件按需动态加载，不会阻塞页面初始化
6. **配置验证**：在开发环境下，系统会自动验证配置与CSS文件的同步性
7. **自动注册**：新主题会自动添加到主题列表、分组和切换序列中

## 文件结构

```
src/lib/theme/
├── config.ts          # 主题配置加载器（自动扫描JSON文件）
├── loader.ts          # 主题CSS加载器（自动扫描、动态加载）
├── configs/           # 主题配置文件目录（JSON格式）
│   ├── harmony.json
│   ├── harmony-dark.json
│   ├── aqua.json
│   ├── noir.json
│   └── mono.json
├── styles/            # 主题CSS文件目录
│   ├── harmony.css
│   ├── harmony-dark.css
│   ├── aqua.css
│   ├── noir.css
│   └── mono.css
└── README.md          # 本文件
```

## 配置方式

主题配置支持两种方式，可以单独使用或结合使用：

### 方式1：CSS 变量配置（推荐用于简单主题）

在 CSS 文件中使用 `--theme-*` 变量定义主题元数据：

```css
:root[data-theme="themeId"] {
	/* 主题元数据 */
	--theme-label: "主题名称";
	--theme-description: "主题描述";
	--theme-mode: light;  /* 或 dark */
	--theme-family: harmony;  /* harmony | glass | neo | mono */
	--theme-order: 10;  /* 数字，越小越靠前 */
	--theme-badge: "推荐";  /* 可选 */
	--theme-preview-background: linear-gradient(...);
	--theme-preview-accent: linear-gradient(...);
	--theme-preview-border: rgba(...);
	--theme-features: "特性1,特性2,特性3";  /* 逗号分隔 */
	
	/* 主题样式变量 */
	--primary-color: #007DFF;
	/* ... */
}
```

**支持的 CSS 变量**：
- `--theme-label`: 主题显示名称（必需）
- `--theme-description`: 主题描述
- `--theme-mode`: 主题模式，`light` 或 `dark`（必需）
- `--theme-family`: 主题家族
- `--theme-order`: 排序值（数字）
- `--theme-badge`: 徽章文本
- `--theme-preview-background`: 预览背景
- `--theme-preview-accent`: 预览强调色
- `--theme-preview-border`: 预览边框色
- `--theme-features`: 特性列表（逗号分隔的字符串）

### 方式2：JSON 配置文件

JSON配置文件必须包含以下字段：

```typescript
{
	"id": string;              // 主题ID（必须与文件名一致，会自动设置）
	"label": string;           // 主题显示名称
	"description": string;     // 主题描述
	"mode": "light" | "dark";  // 主题模式
	"family": "system" | "harmony" | "glass" | "neo" | "mono";  // 主题家族
	"order"?: number;          // 可选：排序字段，数字越小越靠前，未指定则排在最后
	"badge"?: string;          // 可选：徽章文本（如"推荐"）
	"preview": {               // 预览样式
		"background": string;  // 背景渐变
		"accent": string;      // 强调色渐变
		"border": string;      // 边框颜色
	},
	"features": string[];      // 特性列表
}
```

### 配置合并规则

- **JSON 配置优先**：如果同时存在 CSS 变量和 JSON 配置，JSON 配置中的字段会覆盖 CSS 变量
- **CSS 变量补充**：如果 JSON 配置中缺少某些字段，系统会尝试从 CSS 变量中获取
- **必需字段**：`label` 和 `mode` 是必需字段，必须至少在一个配置源中提供

### 排序字段说明

`order` 字段用于控制主题在列表中的显示顺序：
- **数字越小越靠前**：`order: 1` 会排在 `order: 2` 之前
- **未指定则排在最后**：没有 `order` 字段的主题会排在所有有 `order` 的主题之后
- **相同 order 按字母顺序**：如果多个主题的 `order` 相同，则按 `id` 的字母顺序排序
- **auto 主题固定为 0**：自适应模式主题始终排在最前面

示例排序：
- `order: 0` → auto 主题（固定）
- `order: 1` → harmony（浅色）
- `order: 2` → harmony-dark（暗色）
- `order: 10` → aqua
- `order: 11` → mono
- `order: 12` → noir
- 无 order → 排在最后

## 注意事项

- **CSS文件名必须与JSON文件名完全匹配**（不包括扩展名）
- 主题CSS必须使用 `:root[data-theme="{themeId}"]` 选择器
- JSON配置中的 `id` 字段会被自动设置为文件名（即使JSON中有不同的值）
- 系统会在开发环境下自动检测配置与CSS文件的不一致
- 添加新主题后，无需修改任何代码文件，系统会自动识别

## 主题CSS变量规范

每个主题CSS文件应定义以下CSS变量（根据主题需要）：

- 颜色变量：`--primary-color`, `--accent-color`, `--text-primary` 等
- 背景变量：`--bg-primary`, `--card-bg`, `--app-background` 等
- 边框变量：`--border-color`, `--border-light` 等
- 阴影变量：`--shadow-sm`, `--shadow-md` 等
- 其他：`--radius-*`, `--font-sans-primary` 等

参考现有主题文件了解完整的变量列表。

