<script lang="ts">
  import type { NavItem as NavItemType } from "../types";
  import { favorites } from "../stores/favorites";
  import MarkdownRenderer from "./MarkdownRenderer.svelte";
  import { getFaviconCandidates } from "../utils/icon";
  import { onMount } from "svelte";
  import { page } from '$app/state';

  interface Props {
    item: NavItemType;
    showDescription?: boolean;
  }

  let { item, showDescription = false }: Props = $props();

  import { ICON_CONFIG } from "../constants";
  import { loadMarkdownContent } from "$lib/dataLoader";

  // 图标加载超时时间（毫秒）
  const ICON_TIMEOUT = ICON_CONFIG.TIMEOUT;

  // 获取所有可能的图标 URL（按优先级排序）
  const iconCandidates = $derived(getFaviconCandidates(item.url, item.icon));
  let currentIconIndex = $state(0);
  let currentIconUrl = $derived(iconCandidates[currentIconIndex] || "");
  let hasError = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let imgElement = $state<HTMLImageElement | null>(null);

  let showFullDescription = $state(false);
  let favoriteIds = $state<string[]>([]);

  $effect(() => {
    const unsubscribe = favorites.subscribe((favs) => {
      favoriteIds = favs;
    });
    return unsubscribe;
  });

  let isFavorite = $derived(favoriteIds.includes(item.id));

  function toggleFavorite() {
    favorites.toggle(item.id);
  }

  // 尝试下一个图标
  function tryNextIcon() {
    // 清除当前超时
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (currentIconIndex < iconCandidates.length - 1) {
      currentIconIndex++;
    } else {
      hasError = true;
    }
  }

  // 设置图标加载超时
  function setupIconTimeout() {
    // 清除之前的超时
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 如果当前图标 URL 存在，设置超时
    if (currentIconUrl && !hasError) {
      timeoutId = setTimeout(() => {
        // 检查图片是否已加载完成
        if (imgElement && !imgElement.complete) {
          // 图片仍在加载，超时了，尝试下一个
          tryNextIcon();
        }
      }, ICON_TIMEOUT);
    }
  }

  // 监听图标 URL 变化，设置超时
  $effect(() => {
    if (currentIconUrl) {
      setupIconTimeout();
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });
</script>

<article class="nav-item">
  <div class="nav-item-header">
    <div class="nav-item-icon">
      {#if hasError}
        <div class="icon-placeholder">{item.name[0]}</div>
      {:else if currentIconUrl}
        <img
          bind:this={imgElement}
          src={currentIconUrl}
          alt={item.name}
          loading="lazy"
          onload={() => {
            // 图片加载成功，清除超时
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
          }}
          onerror={() => {
            // 图片加载失败，尝试下一个
            tryNextIcon();
          }}
        />
      {/if}
    </div>
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

  {#if showDescription && item.desc_md}
    <div class="nav-item-description">
      <button
        class="toggle-description"
        onclick={() => (showFullDescription = !showFullDescription)}
      >
        {showFullDescription ? "收起介绍" : "展开介绍"}
      </button>
      <div class:hidden={!showFullDescription}>
        <MarkdownRenderer {item} />
      </div>
    </div>
  {/if}

  <div class="nav-item-footer">
    <a href="/item/{item.id}" class="detail-link">查看详情</a>
    <a
      href="{item.url}?utm_source={page.url.hostname}&utm_medium=navigation"
      target="_blank"
      rel="noopener noreferrer"
      class="external-link"
    >
      访问网站 →
    </a>
  </div>
</article>

<style>
  .hidden {
    display: none;
  }

  .nav-item {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    transition: all var(--transition-base);
    position: relative;
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .nav-item:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
    border-color: var(--primary-light);
  }

  .nav-item:active {
    transform: translateY(-2px);
  }

  .nav-item-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .nav-item-icon {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: var(--radius-md);
    overflow: hidden;
    background: linear-gradient(135deg, var(--primary-light) 0%, #e0e7ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-sm);
    border: 2px solid var(--border-light);
    transition: all var(--transition-base);
  }

  .nav-item:hover .nav-item-icon {
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
  }

  .nav-item-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .icon-placeholder {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text-secondary);
    text-transform: uppercase;
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
    color: var(--text-primary);
    text-decoration: none;
    transition: all var(--transition-base);
    display: inline-block;
  }

  .nav-item-name a.item-link:hover {
    color: var(--primary-color);
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
    background: var(--bg-tertiary);
    border: none;
    cursor: pointer;
    padding: var(--spacing-sm);
    color: var(--text-tertiary);
    transition: all var(--transition-base);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    width: 36px;
    height: 36px;
  }

  .favorite-btn:hover {
    color: var(--primary-color);
    background: var(--primary-light);
    transform: scale(1.1);
  }

  .favorite-btn.favorited {
    color: var(--accent-color);
    background: rgba(239, 68, 68, 0.1);
  }

  .favorite-btn:active {
    transform: scale(0.95);
  }

  .nav-item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }

  .tag {
    font-size: 0.75rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    background: linear-gradient(
      135deg,
      var(--tag-bg) 0%,
      var(--bg-tertiary) 100%
    );
    color: var(--text-secondary);
    border-radius: var(--radius-sm);
    font-weight: 500;
    border: 1px solid var(--border-light);
    transition: all var(--transition-fast);
  }

  .tag:hover {
    background: var(--primary-light);
    color: var(--primary-color);
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }

  .nav-item-description {
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-light);
  }

  .toggle-description {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    font-size: 0.875rem;
    padding: var(--spacing-sm) 0;
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
    transition: all var(--transition-base);
  }

  .toggle-description:hover {
    color: var(--primary-hover);
    transform: translateX(4px);
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
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.875rem;
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: all var(--transition-base);
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
  }

  .detail-link {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .detail-link:hover {
    background: var(--primary-color);
    color: var(--text-inverse);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .external-link {
    background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
    color: var(--text-inverse);
    box-shadow: var(--shadow-sm);
  }

  .external-link:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .external-link:active,
  .detail-link:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    .nav-item {
      padding: var(--spacing-md);
    }

    .nav-item-icon {
      width: 48px;
      height: 48px;
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

    .nav-item-icon {
      width: 40px;
      height: 40px;
    }

    .icon-placeholder {
      font-size: 1.5rem;
    }

    .nav-item-name {
      font-size: 0.9375rem;
    }
  }
</style>
