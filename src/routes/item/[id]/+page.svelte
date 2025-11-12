<script lang="ts">
  import type { PageData } from "./$types";
  import { favorites } from "$lib/stores/favorites";
  import { getFaviconCandidates } from "$lib/utils/icon";
  import { onMount } from "svelte";
  import MarkdownRenderer from "$lib/components/MarkdownRenderer.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // 图标加载超时时间（毫秒）
  const ICON_TIMEOUT = 3000; // 3秒

  // 获取所有可能的图标 URL（按优先级排序）
  const iconCandidates = $derived(
    getFaviconCandidates(data.item.url, data.item.icon),
  );
  let currentIconIndex = $state(0);
  let currentIconUrl = $derived(iconCandidates[currentIconIndex] || "");
  let hasError = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let imgElement = $state<HTMLImageElement | null>(null);

  let favoriteIds = $state<string[]>([]);

  $effect(() => {
    const unsubscribe = favorites.subscribe((favs) => {
      favoriteIds = favs;
    });
    return unsubscribe;
  });

  let isFavorite = $derived(favoriteIds.includes(data.item.id));

  function toggleFavorite() {
    favorites.toggle(data.item.id);
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

<svelte:head>
  <title>{data.item.name} - {data.site?.name}</title>
  <meta
    name="description"
    content={data.item.info || `${data.item.name} - ${data.item.group}分组`}
  />
  <meta name="keywords" content={data.item.tags.join(", ")} />
</svelte:head>

<div class="item-detail-page">
  <div class="item-header">
    <a href="/" class="back-link" data-sveltekit-preload-data="hover">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>返回首页</span>
    </a>
  </div>

  <article class="item-detail">
    <div class="item-detail-header">
      <div class="item-icon">
        {#if hasError}
          <div class="icon-placeholder">{data.item.name[0]}</div>
        {:else if currentIconUrl}
          <img
            bind:this={imgElement}
            src={currentIconUrl}
            alt={data.item.name}
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
      <div class="item-info">
        <h1 class="item-name">{data.item.name}</h1>
        {#if data.item.info}
          <p class="item-brief">{data.item.info}</p>
        {/if}
        <div class="item-meta">
          <span class="item-group">分组：{data.item.group}</span>
          {#if data.item.tags.length > 0}
            <div class="item-tags">
              {#each data.item.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      <div class="item-actions">
        <a
          href="{data.item.url}?utm_source={data.site
            ?.domain}&utm_medium=navigation"
          target="_blank"
          rel="noopener noreferrer"
          class="visit-btn"
        >
          访问网站 →
        </a>
        <button
          class="favorite-btn"
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
          <span>{isFavorite ? "已收藏" : "收藏"}</span>
        </button>
      </div>
    </div>

    {#if data.item.desc_md}
      <div class="item-description">
        <h2 class="description-title">详细介绍</h2>
        <MarkdownRenderer item={data.item} />
      </div>
    {/if}

    <div class="item-footer">
      <a href="/group/{data.item.group}" class="group-link">
        查看 {data.item.group} 分组下的所有网站 →
      </a>
    </div>
  </article>
</div>

<style>
  .item-detail-page {
    padding: 2rem 0 4rem 0;
    max-width: 1000px;
    margin: 0 auto;
  }

  .item-header {
    margin-bottom: 2rem;
  }

  .back-link {
    color: var(--text-secondary, #6b7280);
    text-decoration: none;
    font-size: 0.875rem;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-weight: 500;
    background: var(--card-bg, #fff);
    border: 1px solid var(--border-color, #e5e7eb);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .back-link:hover {
    color: var(--primary-color, #3b82f6);
    background: rgba(59, 130, 246, 0.05);
    border-color: var(--primary-color, #3b82f6);
    transform: translateX(-4px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  }

  .back-link:active {
    transform: translateX(-2px);
  }

  .back-link svg {
    flex-shrink: 0;
  }

  .item-detail {
    background: var(--card-bg, #fff);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;
  }

  .item-detail:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .item-detail-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid var(--border-color, #e5e7eb);
  }

  .item-icon {
    flex-shrink: 0;
    width: 96px;
    height: 96px;
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      var(--icon-bg, #f3f4f6) 0%,
      #e5e7eb 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.8);
  }

  .item-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .icon-placeholder {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--text-secondary, #6b7280);
  }

  .item-info {
    flex: 1;
    min-width: 0;
  }

  .item-name {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    color: var(--text-primary, #111827);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .item-brief {
    font-size: 1.125rem;
    color: var(--text-secondary, #6b7280);
    margin: 0 0 1.25rem 0;
    line-height: 1.7;
    font-weight: 400;
  }

  .item-meta {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .item-group {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: var(--tag-bg, #f3f4f6);
    border-radius: 6px;
  }

  .item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    font-size: 0.875rem;
    padding: 0.5rem 0.875rem;
    background: linear-gradient(
      135deg,
      var(--primary-color, #3b82f6) 0%,
      #2563eb 100%
    );
    color: #fff;
    border-radius: 8px;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .tag:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-end;
  }

  .visit-btn {
    padding: 0.875rem 2rem;
    background: linear-gradient(
      135deg,
      var(--primary-color, #3b82f6) 0%,
      #2563eb 100%
    );
    color: #fff;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.3s ease;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .visit-btn:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
  }

  .favorite-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.25rem;
    background: var(--tag-bg, #f3f4f6);
    border: 2px solid var(--border-color, #e5e7eb);
    border-radius: 10px;
    cursor: pointer;
    color: var(--text-secondary, #6b7280);
    transition: all 0.3s ease;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .favorite-btn:hover {
    border-color: var(--primary-color, #3b82f6);
    color: var(--primary-color, #3b82f6);
    background: rgba(59, 130, 246, 0.05);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
  }

  .favorite-btn.favorited {
    background: linear-gradient(
      135deg,
      var(--accent-color, #ef4444) 0%,
      #dc2626 100%
    );
    border-color: var(--accent-color, #ef4444);
    color: #fff;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .favorite-btn.favorited:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
    transform: translateY(-2px);
  }

  .item-description {
    margin-top: 2.5rem;
    padding-top: 2.5rem;
    border-top: 2px solid var(--border-color, #e5e7eb);
  }

  .description-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: var(--text-primary, #111827);
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-color, #e5e7eb);
  }

  .item-footer {
    margin-top: 2.5rem;
    padding-top: 2rem;
    border-top: 2px solid var(--border-color, #e5e7eb);
  }

  .group-link {
    color: var(--primary-color, #3b82f6);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .group-link:hover {
    color: var(--primary-hover, #2563eb);
    text-decoration: underline;
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    .item-detail {
      padding: 1.5rem;
    }

    .item-detail-header {
      flex-direction: column;
    }

    .item-icon {
      width: 64px;
      height: 64px;
    }

    .icon-placeholder {
      font-size: 2rem;
    }

    .item-name {
      font-size: 1.5rem;
    }

    .item-actions {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
    }

    .visit-btn,
    .favorite-btn {
      flex: 1;
    }
  }
</style>
