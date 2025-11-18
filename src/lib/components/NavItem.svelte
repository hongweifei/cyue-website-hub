<script lang="ts">
  import { page } from "$app/state";
  import type { NavItem as NavItemType } from "../types";
  import { favorites } from "../stores/favorites";
  import SiteIcon from "./SiteIcon.svelte";

  interface Props {
    item: NavItemType;
    favoriteIds?: string[];
    siteDomain?: string;
  }

  let { item, favoriteIds = [], siteDomain = "" }: Props = $props();

  const fallbackDomain = $derived(page.data?.site?.domain ?? "");
  const resolvedSiteDomain = $derived(siteDomain || fallbackDomain);

  let isFavorite = $derived(favoriteIds.includes(item.id));

  function toggleFavorite() {
    favorites.toggle(item.id);
  }
</script>

<article class="nav-item">
  <div class="nav-item-header">
    <SiteIcon
      item={item}
      size={56}
      interactive
    />
    <div class="nav-item-info">
      <h3 class="nav-item-name">
        <a href="/item/{item.id}" class="item-link">
          {item.name}
        </a>
      </h3>
      {#if item.info}
        <p class="nav-item-brief">{item.info}</p>
      {/if}
    </div>
    <button
      class="favorite-btn"
      class:favorited={isFavorite}
      onclick={toggleFavorite}
      aria-label={isFavorite ? "取消收藏" : "收藏"}
      title={isFavorite ? "取消收藏" : "收藏"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>
    </button>
  </div>

  {#if item.tags.length > 0}
    <div class="nav-item-tags">
      {#each item.tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  {/if}

  <div class="nav-item-footer">
    <a href="/item/{item.id}" class="detail-link">查看详情</a>
    <a
      href="{item.url}?utm_source={resolvedSiteDomain}&utm_medium=navigation"
      target="_blank"
      rel="noopener noreferrer"
      class="external-link"
    >
      访问网站 →
    </a>
  </div>
</article>

<style>
  .nav-item {
    background: var(--component-card-default-bg, var(--card-bg));
    border: 1px solid var(--component-card-default-border, var(--border-light));
    border-radius: var(--component-card-default-radius, var(--radius-xl));
    padding: var(--component-card-default-padding, var(--spacing-lg));
    /* 优化 transition - 只过渡会变化的属性，保留视觉效果 */
    transition: var(
      --component-card-default-transition,
      transform var(--transition-base),
      border-color var(--transition-base),
      box-shadow var(--transition-base),
      background-color var(--transition-base)
    );
    position: relative;
    box-shadow: var(--component-card-default-shadow, var(--shadow-xs));
    backdrop-filter: var(--component-card-default-backdrop, blur(8px));
    -webkit-backdrop-filter: var(--component-card-default-backdrop, blur(8px));
    /* GPU 加速 */
    transform: translateZ(0);
    will-change: transform, box-shadow;
    /* 限制重排范围 */
    contain: layout style paint;
  }

  .nav-item:hover {
    /* 保留所有视觉效果 */
    transform: translateY(-2px) translateZ(0);
    border-color: var(--border-accent);
    box-shadow: var(--component-card-default-shadow-hover, var(--shadow-md));
    background: var(--component-card-default-bg-hover, var(--surface-glass));
  }

  .nav-item:active {
    transform: translateY(0);
  }

  .nav-item-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .nav-item-info {
    flex: 1;
    min-width: 0;
  }

  .nav-item-name {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.4;
  }

  .nav-item-name a.item-link {
    color: var(--component-link-secondary-color, var(--text-primary));
    text-decoration: none;
    /* 只过渡颜色和 transform */
    transition: var(
      --component-link-secondary-transition,
      color var(--transition-base)
    ),
      transform var(--transition-base);
    display: inline-block;
    /* 优化渲染 */
    contain: layout style;
  }

  .nav-item-name a.item-link:hover {
    color: var(--component-link-secondary-color-hover, var(--primary-color));
    transform: translateX(2px);
  }

  .nav-item-brief {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .favorite-btn {
    flex-shrink: 0;
    background: var(--component-button-ghost-bg, var(--bg-tertiary));
    border: 1px solid var(--component-button-ghost-border, var(--border-light));
    cursor: pointer;
    padding: var(--component-button-ghost-padding, var(--spacing-sm));
    color: var(--component-button-ghost-color, var(--text-tertiary));
    /* 只过渡颜色、背景、边框和 transform */
    transition: var(
      --component-button-ghost-transition,
      color var(--transition-fast),
      background-color var(--transition-fast),
      border-color var(--transition-fast),
      transform var(--transition-fast)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--component-button-ghost-radius, var(--radius-md));
    width: 36px;
    height: 36px;
    /* 优化渲染 */
    contain: layout style paint;
  }

  .favorite-btn:hover {
    color: var(--component-button-ghost-color-hover, var(--primary-color));
    background: var(--component-button-ghost-bg-hover, var(--primary-lighter));
    border-color: var(--component-button-ghost-border-hover, var(--border-accent));
    transform: scale(1.05);
  }

  .favorite-btn.favorited {
    color: var(--accent-color);
    background: var(--layer-accent-soft);
    border-color: var(--accent-color);
  }

  .favorite-btn:active {
    transform: scale(0.98);
  }

  .nav-item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }

  .tag {
    font-size: 0.75rem;
    padding: var(--component-tag-default-padding, calc(var(--spacing-xs) * 0.75) var(--spacing-sm));
    background: var(--component-tag-default-bg, var(--tag-bg));
    color: var(--component-tag-default-color, var(--text-secondary));
    border-radius: var(--component-tag-default-radius, var(--radius-full));
    font-weight: 500;
    border: 1px solid var(--component-tag-default-border, var(--border-light));
    /* 只过渡颜色、背景、边框和 transform */
    transition: var(
      --component-tag-default-transition,
      color var(--transition-fast),
      background-color var(--transition-fast),
      border-color var(--transition-fast),
      transform var(--transition-fast)
    );
    /* 优化渲染 */
    contain: layout style;
  }

  .tag:hover {
    background: var(--component-tag-default-bg-hover, var(--primary-light));
    color: var(--component-tag-default-color-hover, var(--primary-color));
    border-color: var(--component-tag-default-border-hover, var(--primary-color));
    transform: translateY(-1px) translateZ(0);
    box-shadow: var(--shadow-xs);
  }

  .nav-item-footer {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-light);
  }

  .detail-link,
  .external-link {
    flex: 1;
    text-align: center;
    padding: var(--component-button-secondary-padding, var(--spacing-sm) var(--spacing-md));
    font-size: 0.875rem;
    border-radius: var(--component-button-secondary-radius, var(--radius-md));
    text-decoration: none;
    /* 优化 transition - 只过渡会变化的属性，保留视觉效果 */
    transition: var(
      --component-button-secondary-transition,
      color var(--transition-base),
      background-color var(--transition-base),
      border-color var(--transition-base),
      transform var(--transition-base),
      opacity var(--transition-base),
      box-shadow var(--transition-base)
    );
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    /* GPU 加速 */
    transform: translateZ(0);
    contain: layout style;
  }

  .detail-link {
    background: var(--component-button-secondary-bg, var(--bg-tertiary));
    color: var(--component-button-secondary-color, var(--text-secondary));
    border: 1px solid var(--component-button-secondary-border, var(--border-light));
    box-shadow: var(--component-button-secondary-shadow, none);
  }

  .detail-link:hover {
    background: var(--component-button-secondary-bg-hover, var(--primary-light));
    color: var(--component-button-secondary-color-hover, var(--primary-color));
    border-color: var(--component-button-secondary-border-hover, var(--primary-color));
    transform: translateY(-1px) translateZ(0);
    box-shadow: var(--component-button-secondary-shadow-hover, var(--shadow-xs));
  }

  .external-link {
    background: var(--component-button-primary-bg, var(--gradient-brand));
    color: var(--component-button-primary-color, var(--text-inverse));
    border: 1px solid var(--component-button-primary-border, transparent);
    box-shadow: var(--component-button-primary-shadow, var(--shadow-xs));
  }

  .external-link:hover {
    transform: translateY(-1px) translateZ(0);
    opacity: 0.95;
    box-shadow: var(--component-button-primary-shadow-hover, var(--shadow-sm));
  }

  .external-link:active,
  .detail-link:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    .nav-item {
      padding: var(--spacing-md);
    }

    .nav-item-name {
      font-size: 1rem;
    }

    .nav-item-brief {
      font-size: 0.8125rem;
    }

    .nav-item-footer {
      flex-direction: column;
    }

    .detail-link,
    .external-link {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .favorite-btn {
      width: 32px;
      height: 32px;
      padding: var(--spacing-xs);
    }
  }

  @media (max-width: 480px) {
    .nav-item {
      padding: var(--spacing-sm);
    }

    .nav-item-name {
      font-size: 0.9375rem;
    }
  }
</style>
