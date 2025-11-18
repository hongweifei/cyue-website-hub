# 组件样式系统使用指南

## 概述

组件样式系统允许主题定义不同组件的样式变体，实现高维护性和低耦合的样式管理。组件通过 CSS 变量获取样式，主题可以独立定义自己的组件样式风格。

## 核心特性

- ✅ **低耦合**：组件通过 CSS 变量获取样式，不依赖主题实现细节
- ✅ **高维护性**：统一的命名规范和类型系统
- ✅ **灵活扩展**：轻松添加新组件和变体
- ✅ **类型安全**：完整的 TypeScript 类型支持
- ✅ **向后兼容**：与现有 CSS 变量系统完全兼容

## 命名规范

### CSS 变量命名

```
--{namespace}-{component}-{variant}-{property}
```

示例：
- `--component-button-primary-bg`
- `--component-card-default-shadow`
- `--component-input-focus-border`

### 组件类名命名

```
{namespace}-{component}-{variant}
```

示例：
- `component-button-primary`
- `component-card-default`
- `component-input-focus`

## 使用方法

### 1. 在组件中使用 CSS 变量

#### 方法一：直接使用 CSS 变量（推荐）

```svelte
<button class="my-button">
  点击我
</button>

<style>
  .my-button {
    background: var(--component-button-primary-bg);
    color: var(--component-button-primary-color);
    border: 1px solid var(--component-button-primary-border);
    border-radius: var(--component-button-primary-radius);
    padding: var(--component-button-primary-padding);
    box-shadow: var(--component-button-primary-shadow);
    transition: var(--component-button-primary-transition);
  }

  .my-button:hover {
    background: var(--component-button-primary-bg-hover);
    box-shadow: var(--component-button-primary-shadow-hover);
  }
</style>
```

#### 方法二：使用工具函数生成变量名

```svelte
<script lang="ts">
  import { componentStyles } from "$lib/theme/components";

  // 获取 CSS 变量名
  const bgVar = componentStyles.button.var("primary", "bg");
  const colorVar = componentStyles.button.var("primary", "color");
</script>

<button class="my-button">
  点击我
</button>

<style>
  .my-button {
    background: var({bgVar});
    color: var({colorVar});
  }
</style>
```

#### 方法三：使用工具函数获取运行时值

```svelte
<script lang="ts">
  import { componentStyles } from "$lib/theme/components";
  import { onMount } from "svelte";

  let bgColor = "";

  onMount(() => {
    // 获取运行时 CSS 变量值
    bgColor = componentStyles.button.value("primary", "bg", "transparent");
  });
</script>

<button style="background: {bgColor}">
  点击我
</button>
```

### 2. 在主题 CSS 中定义组件样式

在主题 CSS 文件中定义组件样式变量：

```css
:root[data-theme="my-theme"] {
  /* Button 组件 - Primary 变体 */
  --component-button-primary-bg: linear-gradient(135deg, #007DFF, #00D9FF);
  --component-button-primary-color: #FFFFFF;
  --component-button-primary-border: transparent;
  --component-button-primary-shadow: 0 4px 12px rgba(0, 125, 255, 0.3);
  --component-button-primary-bg-hover: linear-gradient(135deg, #1890FF, #00B8D9);
  --component-button-primary-shadow-hover: 0 6px 20px rgba(0, 125, 255, 0.4);
  --component-button-primary-radius: 16px;
  --component-button-primary-padding: 12px 24px;
  --component-button-primary-transition: all 250ms cubic-bezier(0.2, 0, 0, 1);

  /* Button 组件 - Secondary 变体 */
  --component-button-secondary-bg: rgba(247, 248, 250, 0.8);
  --component-button-secondary-color: #182431;
  --component-button-secondary-border: rgba(0, 0, 0, 0.08);
  /* ... 更多属性 */
}
```

### 3. 支持多个变体

同一个组件可以定义多个变体：

```css
:root[data-theme="my-theme"] {
  /* Primary 按钮 */
  --component-button-primary-bg: ...;
  
  /* Secondary 按钮 */
  --component-button-secondary-bg: ...;
  
  /* Outline 按钮 */
  --component-button-outline-bg: transparent;
  --component-button-outline-border: ...;
  
  /* Ghost 按钮 */
  --component-button-ghost-bg: transparent;
}
```

在组件中使用不同变体：

```svelte
<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-secondary">次要按钮</button>
<button class="btn btn-outline">轮廓按钮</button>
<button class="btn btn-ghost">幽灵按钮</button>

<style>
  .btn {
    /* 基础样式 */
    border: none;
    cursor: pointer;
    font-weight: 500;
  }

  .btn-primary {
    background: var(--component-button-primary-bg);
    color: var(--component-button-primary-color);
  }

  .btn-secondary {
    background: var(--component-button-secondary-bg);
    color: var(--component-button-secondary-color);
  }

  .btn-outline {
    background: var(--component-button-outline-bg);
    border: 1px solid var(--component-button-outline-border);
    color: var(--component-button-outline-color);
  }

  .btn-ghost {
    background: var(--component-button-ghost-bg);
    color: var(--component-button-ghost-color);
  }
</style>
```

## 支持的组件类型

当前系统支持以下组件类型：

- `button` - 按钮组件
- `card` - 卡片组件
- `input` - 输入框组件
- `tag` - 标签组件
- `link` - 链接组件
- `badge` - 徽章组件
- `tooltip` - 提示框组件
- `modal` - 模态框组件
- `sidebar` - 侧边栏组件
- `header` - 头部组件

## 支持的样式属性

每个组件变体可以定义以下属性：

- `bg` - 背景色
- `bg-hover` - 悬停背景色
- `bg-active` - 激活背景色
- `color` - 文字颜色
- `color-hover` - 悬停文字颜色
- `border` - 边框颜色
- `border-hover` - 悬停边框颜色
- `shadow` - 阴影
- `shadow-hover` - 悬停阴影
- `radius` - 圆角
- `padding` - 内边距
- `gap` - 间距
- `opacity` - 透明度
- `backdrop` - 背景模糊
- `transition` - 过渡效果

## 最佳实践

### 1. 使用语义化的变体名称

✅ 好的命名：
- `primary`, `secondary`, `outline`, `ghost`
- `default`, `elevated`, `glass`
- `success`, `warning`, `error`

❌ 避免的命名：
- `red`, `blue`, `green`（使用语义化名称）
- `style1`, `style2`（不具描述性）

### 2. 提供合理的默认值

在组件中为 CSS 变量提供回退值：

```css
.my-button {
  background: var(--component-button-primary-bg, var(--primary-color));
  color: var(--component-button-primary-color, var(--text-inverse));
}
```

### 3. 保持样式属性的一致性

同一组件的不同变体应该支持相同的属性集合，确保切换变体时不会丢失样式。

### 4. 利用现有主题变量

在定义组件样式时，尽量引用现有的主题变量，保持一致性：

```css
--component-button-primary-bg: var(--gradient-brand);
--component-button-primary-color: var(--text-inverse);
--component-button-primary-shadow: var(--shadow-soft);
```

## 扩展组件样式

### 添加新的组件类型

1. 在 `src/lib/theme/config.ts` 中添加组件类型：

```typescript
export type ComponentType = 
  | "button"
  | "card"
  | "my-new-component"; // 添加新组件
```

2. 在主题 CSS 中定义样式变量：

```css
--component-my-new-component-default-bg: ...;
--component-my-new-component-default-color: ...;
```

3. 在组件中使用：

```svelte
<div class="my-component">
  <!-- 内容 -->
</div>

<style>
  .my-component {
    background: var(--component-my-new-component-default-bg);
    color: var(--component-my-new-component-default-color);
  }
</style>
```

### 添加新的变体

只需在主题 CSS 中添加新的变量定义：

```css
/* 添加新的按钮变体 */
--component-button-danger-bg: #FF4D4F;
--component-button-danger-color: #FFFFFF;
--component-button-danger-bg-hover: #FF7875;
```

## 类型安全

系统提供完整的 TypeScript 类型支持：

```typescript
import type { ComponentType, ComponentStyleProperty } from "$lib/theme/config";
import { componentStyles } from "$lib/theme/components";

// 类型安全的组件类型
const component: ComponentType = "button"; // ✅
const invalid: ComponentType = "invalid"; // ❌ TypeScript 错误

// 类型安全的属性
const property: ComponentStyleProperty = "bg"; // ✅
const invalidProp: ComponentStyleProperty = "invalid"; // ❌ TypeScript 错误

// 类型安全的工具函数
const bgVar = componentStyles.button.var("primary", "bg"); // ✅
```

## 示例

查看以下文件了解完整示例：

- `src/lib/theme/styles/harmony.css` - 浅色主题组件样式定义
- `src/lib/theme/styles/harmony-dark.css` - 深色主题组件样式定义
- `src/lib/theme/components.ts` - 组件样式工具函数

## 常见问题

### Q: 如何在不支持组件样式的主题中提供回退？

A: 在组件样式中使用回退值：

```css
.my-button {
  background: var(--component-button-primary-bg, var(--primary-color));
}
```

### Q: 可以动态切换组件变体吗？

A: 可以，通过动态类名或内联样式：

```svelte
<script>
  let variant = "primary";
</script>

<button class="btn btn-{variant}">
  按钮
</button>
```

### Q: 如何为特定组件覆盖主题样式？

A: 使用 CSS 选择器优先级或自定义 CSS 变量：

```css
.my-special-button {
  --component-button-primary-bg: #custom-color;
  background: var(--component-button-primary-bg);
}
```

## 总结

组件样式系统提供了灵活、可维护的样式管理方案。通过 CSS 变量和统一的命名规范，实现了组件与主题之间的低耦合，同时保持了类型安全和易于扩展的特性。

