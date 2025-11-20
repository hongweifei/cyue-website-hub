# CSS 变量参考文档

本文档列出了项目中所有可用的 CSS 变量，方便开发主题时查阅。所有变量定义参考 `harmony.css`（默认主题）和 `app.css`。

## 目录

- [变量层次结构](#变量层次结构)
- [主题元数据变量](#主题元数据变量)
- [布局配置变量](#布局配置变量)
- [基础样式变量](#基础样式变量)
- [组件样式变量](#组件样式变量)
- [移动端变量](#移动端变量)
- [使用示例](#使用示例)

## 变量层次结构

CSS 变量分为三个层次：

1. **全局基础变量**（`app.css`）- 可在主题中覆盖
2. **主题基础变量**（主题 CSS）- 主题特定的颜色和样式
3. **组件样式变量**（主题 CSS）- 组件特定的样式

```
app.css (全局基础变量)
    ↓ 可被覆盖
主题 CSS (主题基础变量)
    ↓ 可引用
组件样式变量
    ↓ 被使用
components.css (组件类样式)
```

## 主题元数据变量

用于定义主题的基本信息和预览样式，支持通过 CSS 变量或 JSON 配置。

| 变量名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `--theme-label` | `string` | 主题显示名称（必需） | `"鸿蒙·晨曦"` |
| `--theme-description` | `string` | 主题描述 | `"官方浅色，柔和玻璃质感"` |
| `--theme-mode` | `"light" \| "dark"` | 主题模式（必需） | `light` |
| `--theme-family` | `string` | 主题家族 | `"harmony"` |
| `--theme-order` | `number` | 排序值，数字越小越靠前 | `1` |
| `--theme-badge` | `string` | 徽章文本（可选） | `"推荐"` |
| `--theme-preview-background` | `string` | 预览背景（CSS 值） | `linear-gradient(135deg, #f5fbff, #dbeafe)` |
| `--theme-preview-accent` | `string` | 预览强调色（CSS 值） | `linear-gradient(120deg, #0ea5e9, #6366f1)` |
| `--theme-preview-border` | `string` | 预览边框色（CSS 值） | `rgba(14,165,233,.25)` |
| `--theme-features` | `string` | 特性列表（逗号分隔） | `"玻璃拟态,圆角系统"` |

## 布局配置变量

用于控制页面布局结构，通过 `data-layout-*` 属性应用到 DOM。

| 变量名 | 类型 | 可选值 | 说明 |
|--------|------|--------|------|
| `--theme-layout-profile` | `string` | 任意字符串 | 布局标识（仅用于标记） |
| `--theme-layout-shell` | `string` | `constrained` \| `fluid` \| `immersive` \| `edge-to-edge` | 页面外框架 |
| `--theme-layout-header` | `string` | `floating` \| `stacked` \| `inline` \| `condensed` | 顶部结构 |
| `--theme-layout-navigation` | `string` | `pill` \| `segmented` \| `tabs` \| `minimal` | 导航排布 |
| `--theme-layout-content` | `string` | `sidebar` \| `split` \| `masonry` \| `single` | 内容布局 |
| `--theme-layout-sidebar` | `string` | `panel` \| `floating` \| `condensed` | 侧边栏风格 |
| `--theme-layout-cards` | `string` | `layered` \| `floating` \| `flat` | 卡片处理 |
| `--theme-layout-density` | `string` | `comfortable` \| `cozy` \| `compact` | 密度 |
| `--theme-layout-page-home` | `string` | `default` \| `stack` \| `content-first` | 首页布局 ⚠️ 仅配置功能 |
| `--theme-layout-page-favorites` | `string` | `default` \| `compact` \| `masonry` | 收藏页布局 ⚠️ 仅配置功能 |
| `--theme-layout-page-group` | `string` | `default` \| `compact` | 分组页布局 |
| `--theme-layout-page-item` | `string` | `default` \| `split` \| `full` | 详情页布局 |

## 基础样式变量

### 1. 间距系统（app.css，可在主题中覆盖）

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `--grid-unit` | `length` | `8px` | 基础网格单位 |
| `--spacing-2xs` | `length` | `calc(var(--grid-unit) * 0.5)` | 4px |
| `--spacing-xs` | `length` | `var(--grid-unit)` | 8px |
| `--spacing-sm` | `length` | `calc(var(--grid-unit) * 1.5)` | 12px |
| `--spacing-md` | `length` | `calc(var(--grid-unit) * 2)` | 16px |
| `--spacing-lg` | `length` | `calc(var(--grid-unit) * 3)` | 24px |
| `--spacing-xl` | `length` | `calc(var(--grid-unit) * 4)` | 32px |
| `--spacing-2xl` | `length` | `calc(var(--grid-unit) * 5)` | 40px |
| `--mobile-touch-target` | `length` | `44px` | 移动端触摸目标大小 |

### 2. 圆角系统（app.css，可在主题中覆盖）

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `--radius-xs` | `length` | `8px` | 超小圆角 |
| `--radius-sm` | `length` | `12px` | 小圆角 |
| `--radius-md` | `length` | `16px` | 中等圆角 |
| `--radius-lg` | `length` | `20px` | 大圆角 |
| `--radius-xl` | `length` | `24px` | 超大圆角 |
| `--radius-2xl` | `length` | `32px` | 特大圆角 |
| `--radius-full` | `length` | `9999px` | 完全圆角（圆形） |

### 3. 动画系统（app.css，可在主题中覆盖）

#### 动画时长

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `--motion-duration-fast` | `time` | `150ms` | 快速动画 |
| `--motion-duration-medium` | `time` | `250ms` | 中等动画 |
| `--motion-duration-slow` | `time` | `350ms` | 慢速动画 |
| `--motion-duration-extra-slow` | `time` | `500ms` | 超慢动画 |

#### 缓动函数

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `--motion-easing-standard` | `timing-function` | `cubic-bezier(0.2, 0, 0, 1)` | 标准缓动 |
| `--motion-easing-emphasized` | `timing-function` | `cubic-bezier(0.2, 0, 0, 1)` | 强调缓动 |
| `--motion-easing-decelerate` | `timing-function` | `cubic-bezier(0, 0, 0.2, 1)` | 减速缓动 |
| `--motion-easing-accelerate` | `timing-function` | `cubic-bezier(0.4, 0, 1, 1)` | 加速缓动 |

#### 过渡快捷方式

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `--transition-fast` | `string` | `var(--motion-duration-fast) var(--motion-easing-standard)` | 快速过渡 |
| `--transition-base` | `string` | `var(--motion-duration-medium) var(--motion-easing-standard)` | 基础过渡 |
| `--transition-slow` | `string` | `var(--motion-duration-slow) var(--motion-easing-standard)` | 慢速过渡 |
| `--transition-extra-slow` | `string` | `var(--motion-duration-extra-slow) var(--motion-easing-decelerate)` | 超慢过渡 |

### 4. 字体系统（app.css，可在主题中覆盖）

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `--font-sans-primary` | `string` | `"HarmonyOS Sans", ...` | 主要无衬线字体 |
| `--font-sans-secondary` | `string` | `"HarmonyOS Sans SC", ...` | 次要无衬线字体 |

### 5. 主色调（主题 CSS）

| 变量名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `--primary-color` | `color` | 主色调 | `#007DFF` |
| `--primary-color-strong` | `color` | 强调主色调 | `#0051D5` |
| `--primary-hover` | `color` | 主色调悬停状态 | `#1890FF` |
| `--primary-light` | `color` | 浅色主色调（带透明度） | `rgba(0, 125, 255, 0.12)` |
| `--primary-lighter` | `color` | 更浅的主色调（带透明度） | `rgba(0, 125, 255, 0.08)` |
| `--accent-color` | `color` | 强调色 | `#00D9FF` |
| `--accent-hover` | `color` | 强调色悬停状态 | `#00B8D9` |

### 6. 文字颜色（主题 CSS）

| 变量名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `--text-primary` | `color` | 主要文字颜色 | `#182431` |
| `--text-secondary` | `color` | 次要文字颜色 | `#4D5963` |
| `--text-tertiary` | `color` | 第三级文字颜色 | `#86909C` |
| `--text-muted` | `color` | 弱化文字颜色 | `#A8ADB4` |
| `--text-inverse` | `color` | 反色文字（用于深色背景） | `#FFFFFF` |

### 7. 边框颜色（主题 CSS）

| 变量名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `--border-color` | `color` | 标准边框颜色 | `rgba(0, 0, 0, 0.08)` |
| `--border-soft` | `color` | 柔和边框颜色 | `rgba(0, 0, 0, 0.06)` |
| `--border-light` | `color` | 浅色边框 | `rgba(0, 0, 0, 0.04)` |
| `--border-accent` | `color` | 强调边框颜色 | `rgba(0, 125, 255, 0.2)` |

### 8. 背景颜色（主题 CSS）

| 变量名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `--bg-primary` | `color` | 主要背景色 | `rgba(255, 255, 255, 0.95)` |
| `--bg-secondary` | `color` | 次要背景色 | `rgba(247, 248, 250, 0.8)` |
| `--bg-tertiary` | `color` | 第三级背景色 | `rgba(240, 242, 245, 0.6)` |
| `--surface-glass` | `color` | 玻璃表面背景 | `rgba(255, 255, 255, 0.8)` |
| `--surface-solid` | `color` | 实心表面背景 | `#F7F8FA` |
| `--card-bg` | `color` | 卡片背景 | `rgba(255, 255, 255, 0.95)` |
| `--card-overlay` | `gradient` | 卡片叠加层 | `linear-gradient(...)` |
| `--tag-bg` | `color` | 标签背景 | `rgba(0, 125, 255, 0.1)` |
| `--icon-bg` | `color` | 图标背景 | `rgba(0, 125, 255, 0.12)` |
| `--input-bg` | `color` | 输入框背景 | `rgba(255, 255, 255, 0.98)` |
| `--code-bg` | `color` | 代码块背景 | `rgba(0, 0, 0, 0.04)` |
| `--header-bg` | `color` | 头部背景 | `rgba(255, 255, 255, 0.85)` |
| `--footer-bg` | `color` | 底部背景 | `rgba(247, 248, 250, 0.9)` |
| `--app-background` | `gradient` | 应用整体背景 | `radial-gradient(...), linear-gradient(...)` |

### 9. 阴影系统（主题 CSS）

| 变量名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `--shadow-xs` | `shadow` | 超小阴影 | `0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)` |
| `--shadow-sm` | `shadow` | 小阴影 | `0 3px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)` |
| `--shadow-md` | `shadow` | 中等阴影 | `0 10px 20px rgba(0, 0, 0, 0.08), 0 6px 6px rgba(0, 0, 0, 0.05)` |
| `--shadow-lg` | `shadow` | 大阴影 | `0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.08)` |
| `--shadow-xl` | `shadow` | 超大阴影 | `0 20px 50px rgba(0, 0, 0, 0.12), 0 10px 20px rgba(0, 0, 0, 0.1)` |
| `--shadow-soft` | `shadow` | 柔和阴影（带主色调） | `0 4px 14px rgba(0, 125, 255, 0.12), 0 2px 6px rgba(0, 125, 255, 0.08)` |
| `--shadow-glow` | `shadow` | 发光阴影 | `0 8px 32px rgba(0, 125, 255, 0.2), 0 4px 16px rgba(0, 217, 255, 0.15)` |

### 10. 层级颜色（主题 CSS）

| 变量名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `--layer-primary-soft` | `color` | 主色调柔和层级 | `rgba(0, 125, 255, 0.1)` |
| `--layer-primary-strong` | `color` | 主色调强调层级 | `rgba(0, 125, 255, 0.2)` |
| `--layer-accent-soft` | `color` | 强调色柔和层级 | `rgba(0, 217, 255, 0.1)` |
| `--chip-contrast-surface` | `color` | 芯片对比表面 | `rgba(255, 255, 255, 0.8)` |
| `--chip-contrast-surface-strong` | `color` | 芯片对比表面强调 | `rgba(255, 255, 255, 0.95)` |
| `--gradient-brand` | `gradient` | 品牌渐变 | `linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)` |
| `--gradient-brand-soft` | `gradient` | 柔和品牌渐变 | `linear-gradient(135deg, rgba(0, 125, 255, 0.12) 0%, rgba(0, 217, 255, 0.16) 100%)` |

### 11. 状态颜色（主题 CSS）

| 变量名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| `--success-color` | `color` | 成功状态颜色 | `#52c41a` |
| `--warning-color` | `color` | 警告状态颜色 | `#faad14` |
| `--error-color` | `color` | 错误状态颜色 | `#ff4d4f` |
| `--info-color` | `color` | 信息状态颜色 | `#1890ff` |

## 组件样式变量

组件样式变量遵循命名规范：`--component-{component}-{variant}-{property}`

### Button 组件

#### Primary 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-button-primary-bg` | `color \| gradient` | 背景色 |
| `--component-button-primary-color` | `color` | 文字颜色 |
| `--component-button-primary-border` | `color` | 边框颜色 |
| `--component-button-primary-shadow` | `shadow` | 阴影 |
| `--component-button-primary-bg-hover` | `color \| gradient` | 悬停背景色 |
| `--component-button-primary-shadow-hover` | `shadow` | 悬停阴影 |
| `--component-button-primary-transform-hover` | `transform` | 悬停变换 |
| `--component-button-primary-transform-active` | `transform` | 激活变换 |
| `--component-button-primary-radius` | `length` | 圆角 |
| `--component-button-primary-padding` | `length` | 内边距 |
| `--component-button-primary-transition` | `string` | 过渡效果 |

#### Secondary 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-button-secondary-bg` | `color` | 背景色 |
| `--component-button-secondary-color` | `color` | 文字颜色 |
| `--component-button-secondary-border` | `color` | 边框颜色 |
| `--component-button-secondary-shadow` | `shadow` | 阴影 |
| `--component-button-secondary-bg-hover` | `color` | 悬停背景色 |
| `--component-button-secondary-color-hover` | `color` | 悬停文字颜色 |
| `--component-button-secondary-border-hover` | `color` | 悬停边框颜色 |
| `--component-button-secondary-shadow-hover` | `shadow` | 悬停阴影 |
| `--component-button-secondary-transform-hover` | `transform` | 悬停变换 |
| `--component-button-secondary-transform-active` | `transform` | 激活变换 |
| `--component-button-secondary-radius` | `length` | 圆角 |
| `--component-button-secondary-padding` | `length` | 内边距 |
| `--component-button-secondary-transition` | `string` | 过渡效果 |

#### Outline 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-button-outline-bg` | `color` | 背景色（通常为 transparent） |
| `--component-button-outline-color` | `color` | 文字颜色 |
| `--component-button-outline-border` | `color` | 边框颜色 |
| `--component-button-outline-shadow` | `shadow` | 阴影 |
| `--component-button-outline-bg-hover` | `color` | 悬停背景色 |
| `--component-button-outline-shadow-hover` | `shadow` | 悬停阴影 |
| `--component-button-outline-transform-hover` | `transform` | 悬停变换 |
| `--component-button-outline-transform-active` | `transform` | 激活变换 |
| `--component-button-outline-radius` | `length` | 圆角 |
| `--component-button-outline-padding` | `length` | 内边距 |
| `--component-button-outline-transition` | `string` | 过渡效果 |

#### Ghost 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-button-ghost-bg` | `color` | 背景色（通常为 transparent） |
| `--component-button-ghost-color` | `color` | 文字颜色 |
| `--component-button-ghost-border` | `color` | 边框颜色（通常为 transparent） |
| `--component-button-ghost-shadow` | `shadow` | 阴影 |
| `--component-button-ghost-bg-hover` | `color` | 悬停背景色 |
| `--component-button-ghost-color-hover` | `color` | 悬停文字颜色 |
| `--component-button-ghost-transform-hover` | `transform` | 悬停变换 |
| `--component-button-ghost-transform-active` | `transform` | 激活变换 |
| `--component-button-ghost-radius` | `length` | 圆角 |
| `--component-button-ghost-padding` | `length` | 内边距 |
| `--component-button-ghost-transition` | `string` | 过渡效果 |

### Card 组件

#### Default 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-card-default-bg` | `color` | 背景色 |
| `--component-card-default-border` | `color` | 边框颜色 |
| `--component-card-default-shadow` | `shadow` | 阴影 |
| `--component-card-default-shadow-hover` | `shadow` | 悬停阴影 |
| `--component-card-default-border-hover` | `color` | 悬停边框颜色 |
| `--component-card-default-bg-hover` | `color` | 悬停背景色 |
| `--component-card-default-transform-hover` | `transform` | 悬停变换 |
| `--component-card-default-radius` | `length` | 圆角 |
| `--component-card-default-padding` | `length` | 内边距 |
| `--component-card-default-backdrop` | `filter` | 背景模糊效果 |
| `--component-card-default-transition` | `string` | 过渡效果 |

#### Elevated 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-card-elevated-bg` | `color` | 背景色 |
| `--component-card-elevated-border` | `color` | 边框颜色 |
| `--component-card-elevated-shadow` | `shadow` | 阴影（通常更大） |
| `--component-card-elevated-shadow-hover` | `shadow` | 悬停阴影 |
| `--component-card-elevated-border-hover` | `color` | 悬停边框颜色 |
| `--component-card-elevated-bg-hover` | `color` | 悬停背景色 |
| `--component-card-elevated-transform-hover` | `transform` | 悬停变换 |
| `--component-card-elevated-radius` | `length` | 圆角 |
| `--component-card-elevated-padding` | `length` | 内边距 |
| `--component-card-elevated-backdrop` | `filter` | 背景模糊效果 |
| `--component-card-elevated-transition` | `string` | 过渡效果 |

#### Glass 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-card-glass-bg` | `color` | 背景色（通常半透明） |
| `--component-card-glass-border` | `color` | 边框颜色 |
| `--component-card-glass-shadow` | `shadow` | 阴影 |
| `--component-card-glass-shadow-hover` | `shadow` | 悬停阴影 |
| `--component-card-glass-border-hover` | `color` | 悬停边框颜色 |
| `--component-card-glass-bg-hover` | `color` | 悬停背景色 |
| `--component-card-glass-transform-hover` | `transform` | 悬停变换 |
| `--component-card-glass-radius` | `length` | 圆角 |
| `--component-card-glass-padding` | `length` | 内边距 |
| `--component-card-glass-backdrop` | `filter` | 背景模糊效果（通常更强） |
| `--component-card-glass-transition` | `string` | 过渡效果 |

### Input 组件

#### Default 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-input-default-bg` | `color` | 背景色 |
| `--component-input-default-color` | `color` | 文字颜色 |
| `--component-input-default-border` | `color` | 边框颜色 |
| `--component-input-default-shadow` | `shadow` | 阴影 |
| `--component-input-default-border-hover` | `color` | 悬停边框颜色 |
| `--component-input-default-border-focus` | `color` | 聚焦边框颜色 |
| `--component-input-default-shadow-focus` | `shadow` | 聚焦阴影 |
| `--component-input-default-bg-focus` | `color` | 聚焦背景色 |
| `--component-input-default-transform-focus` | `transform` | 聚焦变换 |
| `--component-input-default-radius` | `length` | 圆角 |
| `--component-input-default-padding` | `length` | 内边距 |
| `--component-input-default-backdrop` | `filter` | 背景模糊效果 |
| `--component-input-default-transition` | `string` | 过渡效果 |

### Tag 组件

#### Default 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-tag-default-bg` | `color` | 背景色 |
| `--component-tag-default-color` | `color` | 文字颜色 |
| `--component-tag-default-border` | `color` | 边框颜色 |
| `--component-tag-default-shadow` | `shadow` | 阴影 |
| `--component-tag-default-bg-hover` | `color` | 悬停背景色 |
| `--component-tag-default-color-hover` | `color` | 悬停文字颜色 |
| `--component-tag-default-border-hover` | `color` | 悬停边框颜色 |
| `--component-tag-default-shadow-hover` | `shadow` | 悬停阴影 |
| `--component-tag-default-transform-hover` | `transform` | 悬停变换 |
| `--component-tag-default-radius` | `length` | 圆角（通常为 full） |
| `--component-tag-default-padding` | `length` | 内边距 |
| `--component-tag-default-transition` | `string` | 过渡效果 |

#### Primary 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-tag-primary-bg` | `color` | 背景色 |
| `--component-tag-primary-color` | `color` | 文字颜色 |
| `--component-tag-primary-border` | `color` | 边框颜色 |
| `--component-tag-primary-shadow` | `shadow` | 阴影 |
| `--component-tag-primary-bg-hover` | `color` | 悬停背景色 |
| `--component-tag-primary-color-hover` | `color` | 悬停文字颜色 |
| `--component-tag-primary-shadow-hover` | `shadow` | 悬停阴影 |
| `--component-tag-primary-transform-hover` | `transform` | 悬停变换 |
| `--component-tag-primary-radius` | `length` | 圆角（通常为 full） |
| `--component-tag-primary-padding` | `length` | 内边距 |
| `--component-tag-primary-transition` | `string` | 过渡效果 |

### Link 组件

#### Default 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-link-default-color` | `color` | 文字颜色 |
| `--component-link-default-color-hover` | `color` | 悬停文字颜色 |
| `--component-link-default-underline` | `gradient` | 下划线样式 |
| `--component-link-default-underline-hover` | `gradient` | 悬停下划线样式 |
| `--component-link-default-transform-hover` | `transform` | 悬停变换 |
| `--component-link-default-transition` | `string` | 过渡效果 |
| `--component-link-default-text-decoration` | `string` | 文字装饰 |
| `--component-link-default-text-decoration-thickness` | `length` | 下划线粗细 |
| `--component-link-default-text-underline-offset` | `length` | 下划线偏移 |

#### Secondary 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-link-secondary-color` | `color` | 文字颜色 |
| `--component-link-secondary-color-hover` | `color` | 悬停文字颜色 |
| `--component-link-secondary-underline` | `gradient` | 下划线样式 |
| `--component-link-secondary-underline-hover` | `gradient` | 悬停下划线样式 |
| `--component-link-secondary-transition` | `string` | 过渡效果 |
| `--component-link-secondary-text-decoration` | `string` | 文字装饰 |
| `--component-link-secondary-text-decoration-thickness` | `length` | 下划线粗细 |
| `--component-link-secondary-text-underline-offset` | `length` | 下划线偏移 |

### Badge 组件

#### Default 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-badge-default-bg` | `color` | 背景色 |
| `--component-badge-default-color` | `color` | 文字颜色 |
| `--component-badge-default-border` | `color` | 边框颜色 |
| `--component-badge-default-shadow` | `shadow` | 阴影（通常为 inset） |
| `--component-badge-default-radius` | `length` | 圆角（通常为 full） |

#### Primary 变体

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--component-badge-primary-bg` | `color` | 背景色 |
| `--component-badge-primary-color` | `color` | 文字颜色 |
| `--component-badge-primary-border` | `color` | 边框颜色 |
| `--component-badge-primary-shadow` | `shadow` | 阴影（通常为 inset） |
| `--component-badge-primary-radius` | `length` | 圆角（通常为 full） |

#### Success / Warning / Error 变体

与 Primary 变体相同的变量结构，只需将 `primary` 替换为 `success`、`warning` 或 `error`：

- `--component-badge-success-*`
- `--component-badge-warning-*`
- `--component-badge-error-*`

## 移动端变量

移动端变量在 `@media (max-width: 768px)` 中定义，用于移动端适配。

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `--mobile-font-size-sm` | `length` | 移动端小字体 |
| `--mobile-font-size-base` | `length` | 移动端基础字体 |
| `--mobile-font-size-lg` | `length` | 移动端大字体 |
| `--mobile-font-size-xl` | `length` | 移动端超大字体 |
| `--mobile-spacing-xs` | `length` | 移动端超小间距 |
| `--mobile-spacing-sm` | `length` | 移动端小间距 |
| `--mobile-spacing-md` | `length` | 移动端中等间距 |
| `--mobile-spacing-lg` | `length` | 移动端大间距 |
| `--mobile-touch-target` | `length` | 移动端触摸目标大小 |
| `--mobile-button-padding` | `length` | 移动端按钮内边距 |
| `--mobile-card-padding` | `length` | 移动端卡片内边距 |
| `--mobile-card-radius` | `length` | 移动端卡片圆角 |

## 使用示例

### 基础使用 - 修改基础变量

```css
:root[data-theme="my-theme"] {
  /* 覆盖 app.css 中的基础变量 */
  --spacing-md: 20px;
  --radius-lg: 24px;
  
  /* 定义主题基础变量 */
  --primary-color: #FF6B6B;
  --text-primary: #1a1a1a;
  --bg-primary: #ffffff;
}
```

### 高阶使用 - 修改组件变量

```css
:root[data-theme="my-theme"] {
  /* 基础变量 */
  --primary-color: #FF6B6B;
  
  /* 组件样式变量 */
  --component-button-primary-bg: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  --component-button-primary-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  --component-card-default-backdrop: blur(20px) saturate(200%);
}
```

### 高级使用 - 直接覆盖组件类

```css
:root[data-theme="my-theme"] .component-button-primary {
  position: relative;
  overflow: hidden;
}

:root[data-theme="my-theme"] .component-button-primary::before {
  content: '';
  position: absolute;
  /* ... 特殊效果 ... */
}
```

## 变量引用关系

### 基础变量引用

```css
/* app.css 中的基础变量 */
--spacing-md: 16px;
--radius-lg: 20px;

/* 主题中可以覆盖 */
--spacing-md: 20px;  /* 覆盖默认值 */
--radius-lg: 24px;   /* 覆盖默认值 */
```

### 组件变量引用基础变量

```css
/* 组件变量引用主题基础变量 */
--component-button-primary-padding: var(--spacing-sm) var(--spacing-lg);
--component-button-primary-radius: var(--radius-lg);
--component-button-primary-bg: var(--gradient-brand);
```

### 组件类使用组件变量

```css
/* components.css 中的组件类 */
.component-button-primary {
  padding: var(--component-button-primary-padding, var(--spacing-md));
  border-radius: var(--component-button-primary-radius, var(--radius-lg));
  background: var(--component-button-primary-bg, var(--primary-color));
}
```

## 快速参考

### 创建新主题时的变量清单

1. **必需的基础变量**：
   - `--primary-color` - 主色调
   - `--text-primary` - 主要文字颜色
   - `--bg-primary` - 主要背景色

2. **推荐的基础变量**：
   - `--accent-color` - 强调色
   - `--text-secondary` - 次要文字颜色
   - `--bg-secondary` - 次要背景色
   - `--border-color` - 边框颜色
   - `--shadow-sm` / `--shadow-md` - 阴影

3. **可选的组件变量**：
   - 根据主题风格需要，定义相应的组件样式变量
   - 参考 `harmony.css` 了解所有可用的组件变量

### 变量命名规范

- **基础变量**：`--{category}-{name}`（如 `--primary-color`、`--spacing-md`）
- **组件变量**：`--component-{component}-{variant}-{property}`（如 `--component-button-primary-bg`）
- **主题元数据**：`--theme-{property}`（如 `--theme-label`、`--theme-mode`）
- **布局配置**：`--theme-layout-{property}`（如 `--theme-layout-content`）

## 参考文件

- **`src/lib/theme/styles/harmony.css`** - 默认主题，包含所有变量的完整定义（主要参考）
- **`src/app.css`** - 全局基础变量（可在主题中覆盖）
- **`src/components.css`** - 组件类样式实现
- **`src/lib/theme/COMPONENT_STYLES.md`** - 组件样式系统详细文档

## 提示

- 创建新主题时，建议复制 `harmony.css` 作为起点
- 所有变量都有回退值，可以只定义需要的变量
- 组件样式变量可以引用基础变量，保持一致性
- 使用 CSS 变量时，建议提供回退值：`var(--my-var, fallback-value)`

