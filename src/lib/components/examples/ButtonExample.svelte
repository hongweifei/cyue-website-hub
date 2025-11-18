<!--
  组件样式系统使用示例 - Button 组件
  
  此文件展示了如何使用组件样式系统来创建支持主题的按钮组件
-->
<script lang="ts">
  import { componentStyles } from "$lib/theme/components";

  interface Props {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
  }

  let {
    variant = "primary",
    size = "md",
    disabled = false
  }: Props = $props();
</script>

<button
  class="btn"
  class:btn--primary={variant === "primary"}
  class:btn--secondary={variant === "secondary"}
  class:btn--outline={variant === "outline"}
  class:btn--ghost={variant === "ghost"}
  class:btn--sm={size === "sm"}
  class:btn--md={size === "md"}
  class:btn--lg={size === "lg"}
  class:btn--disabled={disabled}
  disabled={disabled}
>
  <slot />
</button>

<style>
  .btn {
    /* 基础样式 */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-family: inherit;
    transition: var(--component-button-primary-transition, all var(--transition-base));
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    /* GPU 加速 */
    transform: translateZ(0);
    will-change: transform, box-shadow;
    contain: layout style;
  }

  /* Primary 变体 - 使用组件样式变量 */
  .btn--primary {
    background: var(--component-button-primary-bg, var(--gradient-brand));
    color: var(--component-button-primary-color, var(--text-inverse));
    border: 1px solid var(--component-button-primary-border, transparent);
    border-radius: var(--component-button-primary-radius, var(--radius-md));
    padding: var(--component-button-primary-padding, var(--spacing-sm) var(--spacing-lg));
    box-shadow: var(--component-button-primary-shadow, var(--shadow-soft));
  }

  .btn--primary:hover:not(.btn--disabled) {
    background: var(--component-button-primary-bg-hover, var(--gradient-brand));
    box-shadow: var(--component-button-primary-shadow-hover, var(--shadow-glow));
    transform: translateY(-1px) translateZ(0);
  }

  .btn--primary:active:not(.btn--disabled) {
    transform: translateY(0);
  }

  /* Secondary 变体 */
  .btn--secondary {
    background: var(--component-button-secondary-bg, var(--bg-tertiary));
    color: var(--component-button-secondary-color, var(--text-primary));
    border: 1px solid var(--component-button-secondary-border, var(--border-color));
    border-radius: var(--component-button-secondary-radius, var(--radius-md));
    padding: var(--component-button-secondary-padding, var(--spacing-sm) var(--spacing-lg));
    box-shadow: var(--component-button-secondary-shadow, var(--shadow-xs));
  }

  .btn--secondary:hover:not(.btn--disabled) {
    background: var(--component-button-secondary-bg-hover, var(--primary-light));
    color: var(--component-button-secondary-color-hover, var(--primary-color));
    border-color: var(--component-button-secondary-border-hover, var(--primary-color));
    box-shadow: var(--component-button-secondary-shadow-hover, var(--shadow-sm));
    transform: translateY(-1px) translateZ(0);
  }

  .btn--secondary:active:not(.btn--disabled) {
    transform: translateY(0);
  }

  /* Outline 变体 */
  .btn--outline {
    background: var(--component-button-outline-bg, transparent);
    color: var(--component-button-outline-color, var(--primary-color));
    border: 1px solid var(--component-button-outline-border, var(--primary-color));
    border-radius: var(--component-button-outline-radius, var(--radius-md));
    padding: var(--component-button-outline-padding, var(--spacing-sm) var(--spacing-lg));
    box-shadow: var(--component-button-outline-shadow, none);
  }

  .btn--outline:hover:not(.btn--disabled) {
    background: var(--component-button-outline-bg-hover, var(--primary-lighter));
    box-shadow: var(--component-button-outline-shadow-hover, var(--shadow-xs));
    transform: translateY(-1px) translateZ(0);
  }

  .btn--outline:active:not(.btn--disabled) {
    transform: translateY(0);
  }

  /* Ghost 变体 */
  .btn--ghost {
    background: var(--component-button-ghost-bg, transparent);
    color: var(--component-button-ghost-color, var(--text-secondary));
    border: 1px solid var(--component-button-ghost-border, transparent);
    border-radius: var(--component-button-ghost-radius, var(--radius-md));
    padding: var(--component-button-ghost-padding, var(--spacing-sm) var(--spacing-md));
    box-shadow: var(--component-button-ghost-shadow, none);
  }

  .btn--ghost:hover:not(.btn--disabled) {
    background: var(--component-button-ghost-bg-hover, var(--bg-tertiary));
    color: var(--component-button-ghost-color-hover, var(--text-primary));
    transform: translateY(-1px) translateZ(0);
  }

  .btn--ghost:active:not(.btn--disabled) {
    transform: translateY(0);
  }

  /* 尺寸变体 */
  .btn--sm {
    font-size: 0.875rem;
    padding: calc(var(--spacing-xs) * 0.75) var(--spacing-md);
  }

  .btn--md {
    font-size: 0.9375rem;
  }

  .btn--lg {
    font-size: 1rem;
    padding: var(--spacing-md) var(--spacing-xl);
  }

  /* 禁用状态 */
  .btn--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* 响应式 */
  @media (max-width: 768px) {
    .btn {
      font-size: 0.875rem;
    }

    .btn--lg {
      padding: var(--spacing-sm) var(--spacing-lg);
    }
  }
</style>

