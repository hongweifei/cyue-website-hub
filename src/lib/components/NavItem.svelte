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

<article class="nav-item component-card-default component-card-elevated">
  <div class="nav-item-header">
    <SiteIcon
      item={item}
      size={56}
      interactive
    />
    <div class="nav-item-info">
      <h3 class="nav-item-name">
        <a href="/item/{item.id}" class="item-link component-link-secondary">
          {item.name}
        </a>
      </h3>
      {#if item.info}
        <p class="nav-item-brief">{item.info}</p>
      {/if}
    </div>
    <button
      class="favorite-btn component-button-ghost"
      class:favorited={isFavorite}
      onclick={toggleFavorite}
      aria-label={isFavorite ? "取消收藏" : "收藏"}
      title={isFavorite ? "取消收藏" : "收藏"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
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
        <span class="tag component-tag-default">{tag}</span>
      {/each}
    </div>
  {/if}

  <div class="nav-item-footer">
    <a href="/item/{item.id}" class="detail-link component-button-outline">
      查看详情
    </a>
    <a
      href="{item.url}?utm_source={resolvedSiteDomain}&utm_medium=navigation"
      target="_blank"
      rel="noopener noreferrer"
      class="external-link component-button-primary"
    >
      访问网站 →
    </a>
  </div>
</article>

<style>
  .nav-item {
    position: relative;
    will-change: transform, box-shadow;
    contain: layout style;
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
    display: inline-block;
    /* 优化渲染 */
    contain: layout style;
  }

  .nav-item-name a.item-link:hover {
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
    width: 44px;
    height: 44px;
    contain: layout style paint;
  }

  .favorite-btn svg {
    width: 22px;
    height: 22px;
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
    font-weight: 500;
    contain: layout style;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    transform: translateZ(0);
    contain: layout style;
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
      width: 40px;
      height: 40px;
      padding: var(--spacing-xs) var(--spacing-sm);
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
