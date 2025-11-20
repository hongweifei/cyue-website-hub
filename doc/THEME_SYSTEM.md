# 主题系统文档

## 目录

- [概述](#概述)
- [系统架构](#系统架构)
- [核心功能](#核心功能)
- [快速开始](#快速开始)
- [详细指南](#详细指南)
- [技术实现](#技术实现)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

## 概述

鸽子导航网的主题系统是一个**完全动态化、零配置**的主题管理解决方案。系统支持自动扫描和加载主题文件，无需修改任何代码即可添加新主题。主题系统不仅管理颜色和样式，还支持布局驱动、组件样式变体等高级功能。

### 核心特性

- ✅ **零配置添加主题**：只需创建 CSS 和 JSON 文件，系统自动识别
- ✅ **双轨配置**：支持 CSS 变量和 JSON 配置文件，灵活组合
- ✅ **动态加载**：按需加载主题 CSS，不阻塞页面初始化
- ✅ **布局驱动**：主题可以控制页面布局结构，无需修改组件代码
- ✅ **组件样式系统**：统一的组件样式管理，支持多变体
- ✅ **自适应模式**：支持跟随系统光暗自动切换
- ✅ **类型安全**：完整的 TypeScript 类型支持
- ✅ **开发友好**：自动验证配置同步，开发环境提示

## 系统架构

### 文件结构

```
项目根目录/
├── src/
│   ├── app.css            # 基础样式变量（全局共享）
│   ├── components.css     # 组件类样式定义
│   └── lib/
│       └── theme/
│           ├── config.ts              # 主题配置加载器（自动扫描 JSON 文件）
│           ├── loader.ts              # 主题 CSS 加载器（动态加载）
│           ├── layout.ts              # 布局配置管理
│           ├── components.ts          # 组件样式工具函数
│           ├── configs/               # 主题配置文件目录（JSON 格式）
│           │   ├── harmony.json
│           │   ├── harmony-dark.json
│           │   └── ...
│           ├── styles/                # 主题 CSS 文件目录
│           │   ├── harmony.css
│           │   ├── harmony-dark.css
│           │   └── ...
│           ├── README.md              # 动态主题系统使用指南
│           └── COMPONENT_STYLES.md    # 组件样式系统使用指南
```

#### 关键文件说明

**`src/app.css`** - 基础样式变量（部分）
- 定义部分全局基础变量（spacing、radius、motion、font 等）
- 这些变量可以在主题中覆盖定制
- 提供设计系统的基础规范，但**不是完整的变量列表**

**`src/components.css`** - 组件类样式
- 定义组件的实际样式实现
- 使用组件样式变量，提供回退值
- 确保组件即使没有定义变量也能正常显示

**`src/lib/theme/styles/harmony.css`** - 默认主题（参考标准）
- **默认主题**，所有基础样式变量的完整参考
- 包含所有可用的基础样式变量定义
- 创建新主题时，可以参考此文件了解所有可用变量
- 定义了完整的颜色系统、阴影系统、层级系统等

**`src/lib/theme/styles/*.css`** - 其他主题 CSS 文件
- 定义主题的基础样式变量和组件样式变量
- 每个主题独立文件
- 通过动态加载器按需加载
- 可以覆盖 `app.css` 中的基础变量

### 架构层次

```
┌─────────────────────────────────────┐
│     主题 Store (theme.ts)           │  ← 状态管理
│  - 主题切换                          │
│  - 持久化存储                        │
│  - 循环切换                          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     主题管理器 (ThemeManager)        │  ← 主题应用
│  - CSS 动态加载                      │
│  - 布局属性应用                      │
│  - 自适应模式处理                    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     配置加载器 (config.ts)           │  ← 配置管理
│  - 自动扫描 JSON 配置                │
│  - 解析 CSS 元数据                   │
│  - 配置合并                          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     CSS 加载器 (loader.ts)           │  ← 资源管理
│  - 自动扫描 CSS 文件                 │
│  - 动态加载/卸载                     │
│  - 预加载支持                        │
└─────────────────────────────────────┘
```

### 数据流

```
用户操作（切换主题）
    ↓
theme.set() / theme.cycle()
    ↓
ThemeManager.apply()
    ↓
loadThemeCSS() → 动态加载 CSS
    ↓
applyLayoutProfile() → 应用布局属性
    ↓
document.documentElement.dataset → 更新 DOM
    ↓
CSS 变量生效 → 页面样式更新
```

## 核心功能

### 1. 动态主题加载

系统使用 Vite 的 `import.meta.glob` 自动扫描主题文件：

- **CSS 文件扫描**：自动发现 `styles/*.css` 文件
- **配置文件扫描**：自动发现 `configs/*.json` 文件
- **元数据提取**：从 CSS 变量中提取主题元数据
- **配置合并**：合并 CSS 和 JSON 配置（JSON 优先）

### 2. 双轨配置系统

主题配置支持两种方式，可以单独使用或结合使用：

#### 方式一：CSS 变量配置

在 CSS 文件中使用 `--theme-*` 变量定义元数据：

```css
:root[data-theme="ocean"] {
  --theme-label: "海洋蓝调";
  --theme-mode: light;
  --theme-order: 20;
  /* ... 样式变量 ... */
}
```

#### 方式二：JSON 配置文件

在 JSON 文件中定义完整配置：

```json
{
  "id": "ocean",
  "label": "海洋蓝调",
  "mode": "light",
  "order": 20,
  "layout": {
    "tokens": {
      "content": "split"
    }
  }
}
```

**配置优先级**：JSON 配置 > CSS 变量

### 3. 布局驱动系统

主题可以控制页面布局结构，通过 `data-layout-*` 属性实现：

```css
/* 主题 CSS 中定义布局 */
:root[data-theme="glass"] {
  --theme-layout-content: split;
  --theme-layout-cards: floating;
}
```

```json
/* 或 JSON 配置中定义 */
{
  "layout": {
    "tokens": {
      "content": "split",
      "cards": "floating"
    }
  }
}
```

系统会自动将布局配置应用到 `<html>` 元素：

```html
<html data-layout-content="split" data-layout-cards="floating">
```

组件可以通过 CSS 选择器响应布局变化：

```css
[data-layout-content="split"] .content-area {
  display: grid;
  grid-template-columns: 1fr 2fr;
}
```

### 4. 组件样式系统

统一的组件样式管理，支持多变体：

```css
/* 定义组件样式 */
:root[data-theme="my-theme"] {
  --component-button-primary-bg: linear-gradient(...);
  --component-button-primary-color: #fff;
  --component-card-default-shadow: 0 4px 12px rgba(...);
}
```

```svelte
<!-- 在组件中使用 -->
<button class="my-button">点击</button>

<style>
  .my-button {
    background: var(--component-button-primary-bg);
    color: var(--component-button-primary-color);
  }
</style>
```

### 5. 自适应模式

支持跟随系统光暗自动切换：

- 检测 `prefers-color-scheme` 媒体查询
- 自动在浅色/深色主题间切换
- 监听系统主题变化，实时更新

## 快速开始

### 添加新主题

#### 步骤 1：创建 CSS 文件

在 `src/lib/theme/styles/` 目录下创建 `ocean.css`：

```css
:root[data-theme="ocean"] {
  color-scheme: light;
  
  /* 主题元数据 */
  --theme-label: "海洋蓝调";
  --theme-description: "清新海洋风格";
  --theme-mode: light;
  --theme-family: glass;
  --theme-order: 20;
  
  /* ========== 基础样式变量 ========== */
  /* 提示：可以参考 harmony.css 查看所有可用的基础变量 */
  
  /* 可以覆盖 app.css 中的基础变量（可选） */
  --spacing-md: 18px;  /* 覆盖默认间距 */
  --radius-lg: 22px;   /* 覆盖默认圆角 */
  
  /* 主色调 */
  --primary-color: #0ea5e9;
  --primary-color-strong: #0284c7;
  --accent-color: #06b6d4;
  
  /* 文字颜色 */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-inverse: #ffffff;
  
  /* 背景颜色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f1f5f9;
  --card-bg: rgba(255, 255, 255, 0.9);
  
  /* 边框和阴影 */
  --border-color: rgba(14, 165, 233, 0.2);
  --shadow-sm: 0 2px 4px rgba(14, 165, 233, 0.1);
  
  /* 更多基础变量可以参考 harmony.css */
  
  /* ========== 组件样式变量（可选） ========== */
  /* 如果需要精细控制组件样式，可以定义组件变量 */
  --component-button-primary-bg: linear-gradient(135deg, #0ea5e9, #06b6d4);
  --component-card-default-bg: rgba(255, 255, 255, 0.8);
  --component-card-default-backdrop: blur(12px);
}
```

#### 步骤 2：创建 JSON 配置（可选）

在 `src/lib/theme/configs/` 目录下创建 `ocean.json`：

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

**完成！** 系统会自动识别并注册新主题。

### 使用主题

#### 在组件中切换主题

```svelte
<script>
  import { theme } from '$lib/stores/theme';
  
  function switchTheme() {
    theme.set('ocean');
  }
  
  function cycleTheme() {
    theme.cycle(); // 循环切换所有主题
  }
</script>

<button on:click={switchTheme}>切换到海洋主题</button>
<button on:click={cycleTheme}>下一个主题</button>
```

#### 在组件中使用主题变量

```svelte
<div class="card">
  <h2>标题</h2>
  <p>内容</p>
</div>

<style>
  .card {
    background: var(--card-bg, var(--bg-primary));
    color: var(--text-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
  }
</style>
```

## 详细指南

### CSS 变量层次结构

主题系统使用三层 CSS 变量架构，从基础到高级，提供灵活的定制能力：

```
┌─────────────────────────────────────────┐
│  基础样式变量 (app.css)                  │  ← 全局基础变量
│  - spacing, radius, motion, font        │
│  - 定义在 :root，所有主题共享            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  主题基础变量 (主题 CSS)                  │  ← 主题颜色和样式
│  - primary-color, bg-primary, text-*    │
│  - 定义在 :root[data-theme="xxx"]       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  组件样式变量 (主题 CSS)                  │  ← 组件特定样式
│  - component-button-primary-bg          │
│  - 定义在 :root[data-theme="xxx"]       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  组件类样式 (components.css)             │  ← 组件实现
│  - .component-button-primary            │
│  - 使用组件样式变量，有回退值            │
└─────────────────────────────────────────┘
```

#### 1. 基础样式变量（app.css + 主题 CSS）

基础样式变量分为两部分：

**`app.css` 中定义的基础变量**（可在主题中覆盖）：
```css
:root {
  /* 间距系统 */
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* 圆角系统 */
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  
  /* 动画系统 */
  --transition-fast: 150ms;
  --transition-base: 250ms;
  --motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  
  /* 字体系统 */
  --font-sans-primary: "HarmonyOS Sans", ...;
}
```

**`harmony.css` 中定义的完整基础变量**（参考标准）：
```css
:root[data-theme="harmony"] {
  /* 主色调 */
  --primary-color: #007DFF;
  --primary-color-strong: #0051D5;
  --accent-color: #00D9FF;
  
  /* 文字颜色 */
  --text-primary: #182431;
  --text-secondary: #4D5963;
  --text-inverse: #FFFFFF;
  
  /* 背景颜色 */
  --bg-primary: rgba(255, 255, 255, 0.95);
  --bg-secondary: rgba(247, 248, 250, 0.8);
  --card-bg: rgba(255, 255, 255, 0.95);
  
  /* 边框和阴影 */
  --border-color: rgba(0, 0, 0, 0.08);
  --shadow-sm: 0 3px 6px rgba(0, 0, 0, 0.07);
  --shadow-md: 0 10px 20px rgba(0, 0, 0, 0.08);
  
  /* 更多变量... */
}
```

**特点**：
- `app.css` 中的变量提供默认值，但**可以在主题中覆盖**
- `harmony.css` 是默认主题，包含所有基础样式变量的完整定义
- **创建新主题时，建议参考 `harmony.css` 了解所有可用变量**
- 主题可以覆盖 `app.css` 中的任何变量（如 spacing、radius、motion 等）

#### 2. 主题基础变量（主题 CSS）

定义在主题 CSS 文件中，提供主题的颜色和基础样式：

```css
:root[data-theme="harmony"] {
  /* 主色调 */
  --primary-color: #007DFF;
  --primary-color-strong: #0051D5;
  --accent-color: #00D9FF;
  
  /* 文字颜色 */
  --text-primary: #182431;
  --text-secondary: #4D5963;
  --text-inverse: #FFFFFF;
  
  /* 背景颜色 */
  --bg-primary: rgba(255, 255, 255, 0.95);
  --bg-secondary: rgba(247, 248, 250, 0.8);
  --card-bg: rgba(255, 255, 255, 0.95);
  
  /* 边框颜色 */
  --border-color: rgba(0, 0, 0, 0.08);
  --border-light: rgba(0, 0, 0, 0.04);
  
  /* 阴影 */
  --shadow-sm: 0 3px 6px rgba(0, 0, 0, 0.07);
  --shadow-md: 0 10px 20px rgba(0, 0, 0, 0.08);
}
```

**特点**：
- 每个主题独立定义
- 提供主题的核心视觉风格
- 被组件样式变量引用

#### 3. 组件样式变量（主题 CSS）

定义在主题 CSS 文件中，提供组件特定的样式变量：

```css
:root[data-theme="harmony"] {
  /* Button 组件 - Primary 变体 */
  --component-button-primary-bg: var(--gradient-brand);
  --component-button-primary-color: var(--text-inverse);
  --component-button-primary-border: transparent;
  --component-button-primary-shadow: var(--shadow-soft);
  --component-button-primary-bg-hover: linear-gradient(...);
  --component-button-primary-radius: var(--radius-lg);
  --component-button-primary-padding: var(--spacing-sm) var(--spacing-lg);
  
  /* Card 组件 - Default 变体 */
  --component-card-default-bg: var(--bg-secondary);
  --component-card-default-border: var(--border-light);
  --component-card-default-shadow: var(--shadow-xs);
  --component-card-default-radius: var(--radius-xl);
}
```

**特点**：
- 命名规范：`--component-{component}-{variant}-{property}`
- 可以引用主题基础变量
- 被组件类样式使用，有回退值

#### 4. 组件类样式（components.css）

定义在 `src/components.css` 中，实现组件的实际样式：

```css
.component-button-primary {
  background: var(--component-button-primary-bg, var(--primary-color));
  color: var(--component-button-primary-color, var(--text-inverse));
  border: 1px solid var(--component-button-primary-border, transparent);
  border-radius: var(--component-button-primary-radius, var(--radius-lg));
  padding: var(--component-button-primary-padding, var(--spacing-sm) var(--spacing-lg));
  box-shadow: var(--component-button-primary-shadow, var(--shadow-xs));
  transition: var(--component-button-primary-transition, all var(--transition-base));
}

.component-button-primary:hover {
  background: var(--component-button-primary-bg-hover, var(--primary-hover));
  box-shadow: var(--component-button-primary-shadow-hover, var(--shadow-sm));
}
```

**特点**：
- 使用组件样式变量，提供回退值
- 回退到主题基础变量或基础样式变量
- 确保即使没有定义组件变量也能正常显示

### 主题定制方式

#### 方式一：基础使用 - 修改基础样式变量

最简单的定制方式，只需修改主题基础变量。**可以参考 `harmony.css` 了解所有可用的基础变量**：

```css
:root[data-theme="my-theme"] {
  /* 可以覆盖 app.css 中的基础变量 */
  --spacing-md: 20px;  /* 覆盖默认间距 */
  --radius-lg: 24px;   /* 覆盖默认圆角 */
  
  /* 修改主色调 */
  --primary-color: #FF6B6B;
  --accent-color: #4ECDC4;
  
  /* 修改背景 */
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  
  /* 修改阴影 */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  /* 更多基础变量可以参考 harmony.css */
}
```

**优点**：
- 简单直接，只需修改变量值
- 所有组件自动继承新样式
- 可以覆盖 `app.css` 中的任何基础变量
- 适合快速创建新主题

**适用场景**：
- 创建颜色变体主题
- 快速调整整体色调
- 简单的明暗主题切换
- 调整间距、圆角等基础设计规范

**参考文件**：
- `src/lib/theme/styles/harmony.css` - 查看所有可用的基础样式变量

#### 方式二：高阶使用 - 修改组件样式变量

更精细的控制，直接修改组件样式变量：

```css
:root[data-theme="my-theme"] {
  /* 基础变量 */
  --primary-color: #FF6B6B;
  
  /* 组件样式变量 - 覆盖组件默认样式 */
  --component-button-primary-bg: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  --component-button-primary-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  --component-button-primary-bg-hover: linear-gradient(135deg, #FF5252, #FF6B6B);
  
  --component-card-default-bg: rgba(255, 255, 255, 0.1);
  --component-card-default-backdrop: blur(20px);
  --component-card-default-border: rgba(255, 255, 255, 0.2);
}
```

**优点**：
- 精确控制每个组件的样式
- 可以创建独特的组件风格
- 支持渐变、模糊等高级效果

**适用场景**：
- 需要特殊组件效果的主题
- 玻璃拟态、毛玻璃等风格
- 需要精细调整组件外观

#### 方式三：高级使用 - 直接覆盖组件类样式

最灵活的方式，直接覆盖组件类样式：

```css
:root[data-theme="my-theme"] {
  /* 基础变量和组件变量 */
  --primary-color: #FF6B6B;
  --component-button-primary-bg: linear-gradient(...);
}

/* 直接覆盖组件类样式 */
:root[data-theme="my-theme"] .component-button-primary {
  position: relative;
  overflow: hidden;
}

:root[data-theme="my-theme"] .component-button-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

:root[data-theme="my-theme"] .component-button-primary:hover::before {
  left: 100%;
}
```

**优点**：
- 完全控制组件样式
- 可以添加伪元素、动画等
- 实现复杂的视觉效果

**适用场景**：
- 需要特殊动画效果
- 复杂的视觉设计
- 完全自定义组件外观

**注意事项**：
- 需要更高的 CSS 优先级
- 可能影响组件的响应式行为
- 建议优先使用组件样式变量

### 变量引用关系

变量之间的引用关系：

```css
/* 基础样式变量（app.css - 可在主题中覆盖） */
:root {
  --spacing-md: 16px;
  --radius-lg: 20px;
}

/* 主题基础变量（主题 CSS - 可覆盖 app.css 的变量） */
:root[data-theme="my-theme"] {
  /* 可以覆盖 app.css 中的变量 */
  --spacing-md: 20px;  /* 覆盖默认值 */
  --radius-lg: 24px;   /* 覆盖默认值 */
  
  /* 主题特定的基础变量 */
  --primary-color: #007DFF;
  --shadow-sm: 0 3px 6px rgba(0, 0, 0, 0.07);
}

/* 组件样式变量（主题 CSS） */
--component-button-primary-bg: var(--primary-color);  /* 引用主题变量 */
--component-button-primary-padding: var(--spacing-md); /* 引用基础变量（可能是覆盖后的值） */
--component-button-primary-radius: var(--radius-lg);   /* 引用基础变量（可能是覆盖后的值） */

/* 组件类样式（components.css） */
.component-button-primary {
  background: var(--component-button-primary-bg, var(--primary-color));  /* 有回退 */
  padding: var(--component-button-primary-padding, var(--spacing-md));    /* 有回退 */
  border-radius: var(--component-button-primary-radius, var(--radius-lg)); /* 有回退 */
}
```

**重要说明**：
- `app.css` 中的变量提供默认值，但主题可以覆盖它们
- 如果主题中定义了同名变量，会覆盖 `app.css` 中的值
- 组件样式变量引用的是**当前主题中生效的值**（可能是覆盖后的值）
- **参考 `harmony.css` 查看所有可用的基础样式变量**

### 主题配置字段

#### 必需字段

- `label`：主题显示名称
- `mode`：主题模式（`light` | `dark`）

#### 可选字段

- `id`：主题 ID（自动从文件名获取）
- `description`：主题描述
- `family`：主题家族（`system` | `harmony` | `glass` | `neo` | `mono`）
- `order`：排序值（数字越小越靠前）
- `badge`：徽章文本（如"推荐"）
- `preview`：预览样式配置
- `features`：特性列表
- `layout`：布局配置
- `componentStyles`：组件样式配置

### 布局配置

布局配置允许主题控制页面结构：

```json
{
  "layout": {
    "profile": "glass-neon",
    "tokens": {
      "shell": "fluid",
      "header": "floating",
      "content": "split",
      "sidebar": "panel",
      "cards": "floating",
      "density": "comfortable"
    }
  }
}
```

**支持的布局属性**：

- `shell`：页面外框架（`constrained` | `fluid` | `immersive` | `edge-to-edge`）
- `header`：顶部结构（`floating` | `stacked` | `inline` | `condensed`）
- `navigation`：导航排布（`pill` | `segmented` | `tabs` | `minimal`）
- `content`：内容布局（`sidebar` | `split` | `masonry` | `single`）
- `sidebar`：侧边栏风格（`panel` | `floating` | `condensed`）
- `cards`：卡片处理（`layered` | `floating` | `flat`）
- `density`：密度（`comfortable` | `cozy` | `compact`）
- `pageHome`：首页布局（`default` | `stack` | `content-first`）
- `pageFavorites`：收藏页布局（`default` | `compact` | `masonry`）
- `pageGroup`：分组页布局（`default` | `compact`）
- `pageItem`：详情页布局（`default` | `split` | `full`）

### 组件样式系统

组件样式系统允许主题通过 CSS 变量控制组件的样式，实现低耦合、高维护性的样式管理。

#### 工作原理

1. **组件类定义**（`components.css`）：
   - 定义组件的基础样式结构
   - 使用组件样式变量，提供回退值
   - 确保即使没有定义变量也能正常显示

2. **主题变量定义**（主题 CSS）：
   - 定义组件样式变量
   - 可以引用主题基础变量
   - 覆盖组件的默认样式

3. **变量解析**：
   - 组件类使用 `var(--component-xxx, fallback)` 语法
   - 如果定义了组件变量，使用组件变量
   - 如果没有定义，使用回退值（通常是主题基础变量）

#### 命名规范

CSS 变量命名：`--{namespace}-{component}-{variant}-{property}`

示例：
- `--component-button-primary-bg`
- `--component-card-default-shadow`
- `--component-input-focus-border`

**命名规则**：
- `namespace`：固定为 `component`
- `component`：组件名称（如 `button`、`card`、`input`）
- `variant`：变体名称（如 `primary`、`secondary`、`default`）
- `property`：样式属性（如 `bg`、`color`、`shadow`、`radius`）

#### 支持的组件类型

- `button`：按钮组件
- `card`：卡片组件
- `input`：输入框组件
- `tag`：标签组件
- `link`：链接组件
- `badge`：徽章组件
- `tooltip`：提示框组件
- `modal`：模态框组件
- `sidebar`：侧边栏组件
- `header`：头部组件

#### 支持的样式属性

- `bg`：背景色
- `bg-hover`：悬停背景色
- `bg-active`：激活背景色
- `color`：文字颜色
- `color-hover`：悬停文字颜色
- `border`：边框颜色
- `border-hover`：悬停边框颜色
- `shadow`：阴影
- `shadow-hover`：悬停阴影
- `radius`：圆角
- `padding`：内边距
- `gap`：间距
- `opacity`：透明度
- `backdrop`：背景模糊
- `transition`：过渡效果

### 主题排序

主题按 `order` 字段排序：

- 数字越小越靠前
- 未指定 `order` 的主题排在最后
- `order` 相同的主题按 `id` 字母顺序排序
- `auto` 主题固定为 `order: 0`，始终排在最前面

### 主题分组

系统自动将主题分组：

- **智能模式**：包含 `auto` 主题
- **鸿蒙设计语言**：`family === "harmony"` 的主题
- **创意特调**：其他家族的主题

## 技术实现

### 自动扫描机制

#### CSS 文件扫描

```typescript
const themeCSSModules = import.meta.glob<string>(
  "/src/lib/theme/styles/*.css",
  {
    eager: true,
    query: "?url",
    import: "default"
  }
);
```

#### 配置文件扫描

```typescript
const themeConfigModules = import.meta.glob<ThemeOption>(
  "/src/lib/theme/configs/*.json",
  {
    eager: true,
    import: "default"
  }
);
```

#### CSS 元数据解析

系统从 CSS 文件中解析 `--theme-*` 变量：

```typescript
function parseCSSThemeMetadata(cssText: string, themeId: string): CSSThemeMetadata {
  // 匹配 :root[data-theme="themeId"] 选择器
  // 解析 --theme-* 变量
  // 返回元数据对象
}
```

### 动态加载机制

#### CSS 动态加载

```typescript
export async function loadThemeCSS(themeId: ConcreteThemeId): Promise<void> {
  // 1. 获取 CSS URL
  const cssUrl = THEME_CSS_URL_MAP.get(themeId);
  
  // 2. 移除之前的主题 CSS
  if (currentThemeLink) {
    currentThemeLink.remove();
  }
  
  // 3. 创建新的 link 元素
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssUrl;
  
  // 4. 等待加载完成
  await new Promise((resolve, reject) => {
    link.onload = () => resolve();
    link.onerror = () => reject();
    document.head.appendChild(link);
  });
}
```

#### 布局属性应用

```typescript
private applyLayoutProfile(root: HTMLElement, layoutConfig: ThemeOption["layout"]): void {
  const resolved = resolveLayoutConfig(layoutConfig);
  
  // 设置布局标识
  root.dataset.layoutProfile = resolved.profile;
  
  // 设置布局属性
  for (const [attribute, value] of Object.entries(resolved.tokens)) {
    const datasetKey = layoutAttributeToDatasetKey(attribute);
    root.dataset[datasetKey] = value;
  }
}
```

### 状态管理

#### 主题 Store

```typescript
export const theme = createThemeStore();

// 切换主题
theme.set('ocean');

// 循环切换
theme.cycle();

// 订阅变化
theme.subscribe((currentTheme) => {
  console.log('当前主题:', currentTheme);
});
```

#### 持久化存储

主题选择保存在 `localStorage` 中：

```typescript
const STORAGE_KEY = 'nav-theme';
localStorage.setItem(STORAGE_KEY, themeId);
```

### 自适应模式

```typescript
private async setupAutoTheme(root: HTMLElement): Promise<void> {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  
  // 应用初始主题
  await applyPreference(prefersDark.matches);
  
  // 监听系统主题变化
  prefersDark.addEventListener("change", (event) => {
    await applyPreference(event.matches);
  });
}
```

## 最佳实践

### 1. 主题设计原则

- **保持一致性**：使用统一的颜色系统和间距规范
- **提供回退值**：为 CSS 变量提供合理的默认值
- **考虑可访问性**：确保颜色对比度符合 WCAG 标准
- **优化性能**：避免过度使用复杂的 CSS 效果
- **合理使用变量层次**：
  - 基础主题：只修改基础样式变量
  - 精细主题：修改组件样式变量
  - 特殊主题：必要时直接覆盖组件类样式

### 2. 配置管理

- **优先使用 JSON**：复杂配置使用 JSON，简单配置使用 CSS 变量
- **保持同步**：确保 CSS 文件和 JSON 配置的 `id` 一致
- **合理排序**：使用 `order` 字段控制主题显示顺序
- **添加描述**：为每个主题提供清晰的描述和特性列表
- **变量引用**：
  - 组件样式变量应引用主题基础变量
  - 避免硬编码颜色值，使用变量引用
  - 利用基础样式变量（spacing、radius 等）

### 3. 组件样式

- **使用语义化变体名**：`primary`、`secondary` 而非 `red`、`blue`
- **提供完整属性**：确保所有变体支持相同的属性集合
- **利用现有变量**：尽量引用主题基础变量而非硬编码值
- **保持向后兼容**：组件类已提供回退值，主题只需定义需要的变量
- **变量层次**：
  - 优先使用组件样式变量（方式二）
  - 只在必要时直接覆盖组件类样式（方式三）
  - 避免在主题中重复定义组件类的基础结构

### 4. 布局配置

- **渐进增强**：组件应能在没有布局配置时正常工作
- **语义化选择器**：使用 `[data-layout-*]` 选择器而非硬编码类名
- **合理默认值**：提供合理的默认布局配置

### 5. 性能优化

- **按需加载**：主题 CSS 按需动态加载
- **预加载**：可以预加载常用主题
- **缓存策略**：利用浏览器缓存减少重复加载

## 常见问题

### Q: 如何添加新主题？

A: 只需在 `styles/` 目录创建 CSS 文件，在 `configs/` 目录创建 JSON 配置文件（可选），系统会自动识别。

### Q: CSS 变量和 JSON 配置哪个优先？

A: JSON 配置优先。如果两者都存在，JSON 中的字段会覆盖 CSS 变量。

### Q: 如何让主题控制页面布局？

A: 在主题配置中添加 `layout` 字段，定义布局 tokens。系统会自动将配置应用到 `<html>` 元素的 `data-layout-*` 属性。

### Q: 组件样式变量未生效？

A: 检查：
1. CSS 变量名是否符合命名规范：`--component-{component}-{variant}-{property}`
2. 变量是否在正确的主题选择器中定义：`:root[data-theme="xxx"]`
3. 组件类是否正确使用 `var()` 函数（已在 `components.css` 中定义）
4. 变量优先级：组件样式变量 > 组件类的回退值

### Q: 应该使用基础变量还是组件变量？

A: 根据需求选择：
- **基础变量**：适合快速创建颜色变体，所有组件自动继承
- **组件变量**：适合精细控制组件样式，创建独特的组件效果
- **直接覆盖**：只在需要特殊效果（如动画、伪元素）时使用

### Q: 如何知道哪些变量可用？

A: 参考：
1. **`src/lib/theme/styles/harmony.css`** - **默认主题，包含所有基础样式变量的完整定义**（主要参考）
2. `src/app.css` - 部分基础样式变量（可在主题中覆盖）
3. `src/components.css` - 组件类使用的变量名
4. 其他主题文件 - 查看变量定义示例
5. `src/lib/theme/COMPONENT_STYLES.md` - 组件样式系统完整文档

**提示**：`harmony.css` 是默认主题，包含了所有可用的基础样式变量，是创建新主题的最佳参考。

### Q: 如何实现主题切换动画？

A: 在 CSS 中为需要动画的属性添加 `transition`：

```css
:root {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### Q: 自适应模式如何工作？

A: 系统监听 `prefers-color-scheme` 媒体查询，自动在浅色/深色主题间切换。当系统主题变化时，页面主题也会自动更新。

### Q: 如何调试主题配置？

A: 在开发环境下，系统会在控制台输出：
- 加载的主题列表
- 配置与 CSS 文件的同步性检查
- 缺失的配置或 CSS 文件警告

## 相关文档

- [CSS 变量参考文档](./CSS_VARIABLES.md) - 所有 CSS 变量完整列表和说明（开发主题必备）
- [组件样式系统使用指南](./COMPONENT_STYLES.md) - 组件样式系统完整文档
- [项目架构文档](./ARCHITECTURE.md) - 项目整体架构说明

## 总结

主题系统提供了灵活、可维护的主题管理方案。通过自动扫描、动态加载、布局驱动等特性，实现了零配置添加主题、灵活的配置方式、强大的布局控制能力。系统设计注重类型安全、开发体验和性能优化，为项目提供了强大的主题定制能力。

