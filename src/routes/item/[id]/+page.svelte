<script lang="ts">
  import type { PageData } from "./$types";
  import { favorites } from "$lib/stores/favorites";
  import { encodeGroupIdForUrl } from "$lib/dataLoader";
  import MarkdownRenderer from "$lib/components/MarkdownRenderer.svelte";
  import RelatedRecommendations from "$lib/components/RelatedRecommendations.svelte";
  import SiteIcon from "$lib/components/SiteIcon.svelte";

  let { data }: { data: PageData } = $props();

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
    <a href="/" class="back-link component-button-secondary" data-sveltekit-preload-data="hover">
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

  <article class="item-detail component-card-elevated">
    <div class="item-detail-header">
      <div class="header-main">
        <div class="icon-wrapper">
          <SiteIcon
            item={data.item}
            size={96}
            appearance="muted"
            radius={16}
          />
        </div>
        <div class="item-info">
          <div class="info-header">
            <h1 class="item-name">{data.item.name}</h1>
            <div class="item-actions">
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
          </div>
          {#if data.item.info}
            <p class="item-brief">{data.item.info}</p>
          {/if}
          <div class="item-meta">
            <a href="/group/{encodeGroupIdForUrl(data.item.group)}" class="item-group component-tag-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>{data.item.group}</span>
            </a>
            {#if data.item.tags.length > 0}
              <div class="item-tags">
                {#each data.item.tags as tag}
                  <span class="tag component-tag-default">{tag}</span>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
      <div class="header-actions">
        <a
          href="{data.item.url}?utm_source={data.site
            ?.domain}&utm_medium=navigation"
          target="_blank"
          rel="noopener noreferrer"
          class="visit-btn component-button-primary"
        >
          <span>访问网站</span>
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
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>
    </div>

    {#if data.item.desc_md}
      <div class="item-description">
        <h2 class="description-title">详细介绍</h2>
        <MarkdownRenderer item={data.item} markdownContent={data.markdownContent} />
      </div>
    {/if}

    <div class="item-footer">
      <a href="/group/{encodeGroupIdForUrl(data.item.group)}" class="group-link component-link-default">
        查看 {data.item.group} 分组下的所有网站 →
      </a>
    </div>
  </article>
  <RelatedRecommendations
    recommendations={data.recommendations}
  />
</div>

<style>
  /* 移除最外层容器的卡片样式 */
  :global(.main .container) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    padding: 0 !important;
  }

  :global(.main .container:hover) {
    transform: none !important;
    box-shadow: none !important;
    border-color: transparent !important;
  }

  /* 详情页：禁用 header 的 sticky 定位，聚焦内容 */
  :global(.header) {
    position: static !important;
  }

  .item-detail-page {
    max-width: var(--layout-container-max-width, 1200px);
    width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .item-detail-page > * {
    min-width: 0;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.875rem;
    text-decoration: none;
    font-weight: 500;
  }

  .back-link svg {
    flex-shrink: 0;
  }

  .item-detail {
    transform: none !important;
    padding: var(--spacing-2xl) calc(var(--layout-header-padding-x, var(--spacing-lg)) * var(--layout-density-scale, 1));
    position: relative;
  }

  /* 默认布局：移除相关推荐的卡片样式和内边距，合并到内容卡片中 */
  :global(.recommendations) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    padding: 0 !important;
    margin: 0 !important;
    border-top: 1px solid var(--border-light) !important;
    padding-top: var(--spacing-2xl) !important;
  }

  :global(.recommendations:hover) {
    box-shadow: none !important;
    border-color: var(--border-light) !important;
  }

  @media (min-width: 600px) and (max-width: 1023px) {
    .item-info {
      width: 100%;
      min-width: 0;
    }

    .info-header {
      width: 100%;
      justify-content: space-between;
    }

    .item-name {
      flex: 1;
      min-width: 0;
    }
  }

  @media (min-width: 1024px) {
    .item-detail-page {
      max-width: var(--layout-container-max-width, 1200px);
      width: 100%;
    }

    .item-name {
      font-size: 2.375rem;
    }

    .item-brief {
      font-size: 1.1875rem;
    }
  }

  @media (min-width: 1280px) {
    .item-detail-page {
      max-width: 1400px;
      width: 100%;
    }

    .back-link {
      font-size: 0.9375rem;
      padding: 0.75rem 1.5rem;
    }

    .item-detail-header {
      padding-bottom: 3rem;
      gap: 2.5rem;
    }

    .header-main {
      gap: 2.5rem;
    }

    .icon-wrapper :global(.site-icon) {
      width: 112px;
      height: 112px;
      min-width: 112px;
      min-height: 112px;
    }

    .item-name {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .item-brief {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      line-height: 1.75;
    }

    .item-meta {
      gap: 1.25rem;
      margin-top: 0.75rem;
    }

    .item-group {
      font-size: 0.9375rem;
      padding: 0.5rem 1rem;
    }

    .item-tags {
      gap: 0.625rem;
    }

    .tag {
      font-size: 0.9375rem;
      padding: 0.625rem 1rem;
    }

    .item-actions {
      gap: 1rem;
    }

    .visit-btn {
      padding: 1rem 2.5rem;
      font-size: 1rem;
    }

    .favorite-btn {
      padding: 1rem 1.5rem;
      font-size: 0.9375rem;
    }

    .item-description {
      margin-top: 3rem;
    }

    .description-title {
      font-size: 2rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
    }

    .item-footer {
      margin-top: 3rem;
      padding-top: 2.5rem;
    }

    .group-link {
      font-size: 1rem;
    }
  }

  @media (min-width: 1600px) {
    .item-detail-page {
      max-width: 1600px;
      width: 100%;
    }

    .item-detail-header {
      padding-bottom: 3.5rem;
      gap: 3rem;
    }

    .header-main {
      gap: 3rem;
    }

    .icon-wrapper :global(.site-icon) {
      width: 128px;
      height: 128px;
      min-width: 128px;
      min-height: 128px;
    }

    .item-name {
      font-size: 2.75rem;
    }

    .item-brief {
      font-size: 1.375rem;
    }
  }

  .item-detail-header {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 3rem;
    padding-bottom: 2.5rem;
    position: relative;
    border-bottom: 1px solid var(--border-light);
  }

  .item-detail-header::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 120px;
    height: 2px;
    background: var(--gradient-brand);
    border-radius: var(--radius-full);
  }

  .header-main {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }

  .icon-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .icon-wrapper :global(.site-icon) {
    position: relative;
    transition: transform var(--transition-base);
  }

  .icon-wrapper :global(.site-icon)::after {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: inherit;
    background: var(--gradient-brand-soft);
    opacity: 0;
    transition: opacity var(--transition-base);
    z-index: -1;
  }

  .icon-wrapper:hover :global(.site-icon) {
    transform: scale(1.05);
  }

  .icon-wrapper:hover :global(.site-icon)::after {
    opacity: 0.5;
  }

  .item-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    min-width: 0;
  }

  .item-name {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    line-height: 1.2;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-brief {
    font-size: 1.125rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.75;
    font-weight: 400;
  }

  .item-meta {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-md);
    margin-top: 0.5rem;
  }

  .item-group {
    font-size: 0.875rem;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    text-decoration: none;
    font-weight: 600;
  }

  .item-group svg {
    flex-shrink: 0;
  }

  .item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
    align-items: center;
  }

  .tag {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .item-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: 1.5rem;
    margin-top: 0.5rem;
    border-top: 1px solid var(--border-light);
  }

  .visit-btn {
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9375rem;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .visit-btn svg {
    flex-shrink: 0;
    transition: transform var(--transition-fast);
  }

  .visit-btn:hover svg {
    transform: translateX(2px);
  }

  .favorite-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    flex-shrink: 0;
  }

  .favorite-btn svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  .favorite-btn.favorited {
    background: var(--component-button-primary-bg, var(--gradient-brand));
    border: var(--component-button-primary-border, transparent);
    color: var(--component-button-primary-color, var(--text-inverse));
    box-shadow: var(--component-button-primary-shadow, var(--shadow-soft));
  }

  .favorite-btn.favorited:hover {
    background: var(--component-button-primary-bg-hover, linear-gradient(135deg, var(--primary-hover) 0%, var(--accent-hover) 100%));
    transform: var(--component-button-primary-transform-hover, translateY(-1px) scale(1.02));
    box-shadow: var(--component-button-primary-shadow-hover, var(--shadow-glow));
  }

  .favorite-btn:active {
    transform: var(--component-button-ghost-transform-active, scale(0.98));
  }

  .favorite-btn.favorited:active {
    transform: var(--component-button-primary-transform-active, translateY(0) scale(0.98));
  }

  .item-description {
    margin-top: 2.5rem;
  }

  .description-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: var(--text-primary);
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-light);
    background: var(--gradient-brand);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .item-footer {
    margin-top: 2.5rem;
    padding-top: 2rem;
    border-top: var(--component-card-default-border, 1px solid var(--border-light));
  }

  .group-link {
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  @media (max-width: 768px) {
    .item-detail-page {
      padding: 0;
      max-width: 100%;
      width: 100%;
      gap: 0;
    }

    .item-header {
      margin-bottom: var(--spacing-md);
      padding: 0 var(--spacing-md);
    }

    .back-link {
      padding: var(--spacing-sm) var(--spacing-xs);
      font-size: 0.875rem;
      min-height: 44px;
      -webkit-tap-highlight-color: transparent;
    }

    .back-link:active {
      transform: none;
    }

    .item-detail {
      /* 移动端：移除卡片样式，优化间距 */
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border-radius: 0 !important;
      padding: 0 !important;
    }

    .item-detail:hover {
      box-shadow: none !important;
      border-color: transparent !important;
    }

    :global(.recommendations) {
      padding: 0 0 var(--spacing-xl) 0 !important;
      padding-top: var(--spacing-xl) !important;
      margin: 0 !important;
    }

    .item-detail-header {
      padding-bottom: var(--spacing-xl);
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
      border-bottom: 1px solid var(--border-light);
    }

    .header-main {
      flex-direction: column;
      gap: var(--spacing-lg);
      align-items: flex-start;
    }

    .icon-wrapper {
      align-self: flex-start;
    }

    .icon-wrapper :global(.site-icon) {
      width: 72px !important;
      height: 72px !important;
      min-width: 72px;
      min-height: 72px;
    }

    .item-name {
      font-size: clamp(1.5rem, 5vw, 1.75rem);
      line-height: 1.3;
      margin-bottom: var(--spacing-md);
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      font-weight: 700;
    }

    .item-brief {
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: var(--spacing-lg);
      word-wrap: break-word;
      overflow-wrap: break-word;
      color: var(--text-secondary);
    }

    .item-meta {
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
      flex-wrap: wrap;
    }

    .item-group {
      font-size: 0.8125rem;
      padding: var(--spacing-xs) var(--spacing-sm);
      min-height: 32px;
      display: inline-flex;
      align-items: center;
    }

    .item-tags {
      gap: var(--spacing-xs);
      flex-wrap: wrap;
    }

    .tag {
      font-size: 0.8125rem;
      padding: var(--spacing-xs) var(--spacing-sm);
      min-height: 32px;
      display: inline-flex;
      align-items: center;
    }

    .tag:hover,
    .tag:active {
      transform: none;
      box-shadow: none;
    }

    .info-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
      width: 100%;
    }

    .header-actions {
      padding-top: var(--spacing-md);
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      border-top: 1px solid var(--border-light);
      margin-top: var(--spacing-md);
    }

    .visit-btn {
      width: 100%;
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: 1rem;
      min-height: 48px;
      justify-content: center;
      font-weight: 600;
      -webkit-tap-highlight-color: transparent;
    }

    .favorite-btn {
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      -webkit-tap-highlight-color: transparent;
    }

    .visit-btn:hover,
    .visit-btn:active {
      transform: none;
      box-shadow: var(--shadow-sm);
    }

    .favorite-btn:hover,
    .favorite-btn:active {
      transform: none;
      box-shadow: var(--shadow-sm);
    }

    .favorite-btn.favorited:hover,
    .favorite-btn.favorited:active {
      transform: none;
      box-shadow: var(--shadow-sm);
    }

    .item-description {
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--border-light);
    }

    .description-title {
      font-size: clamp(1.25rem, 4vw, 1.5rem);
      line-height: 1.4;
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      font-weight: 700;
    }

    .item-footer {
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--border-light);
    }

    .group-link {
      font-size: 0.9375rem;
      padding: var(--spacing-sm) 0;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      -webkit-tap-highlight-color: transparent;
    }

    .group-link:hover,
    .group-link:active {
      transform: none;
    }
  }

  @media (max-width: 480px) {

    .item-detail-page {
      padding: 0;
      max-width: 100%;
      width: 100%;
      gap: 0;
    }

    .item-detail {
      padding: 0 !important;
    }

    :global(.recommendations) {
      padding: 0 0 var(--spacing-lg) 0 !important;
    }

    .item-header {
      padding: 0 var(--spacing-sm);
    }

    .item-name {
      font-size: 1.5rem;
    }

    .icon-wrapper :global(.site-icon) {
      width: 64px !important;
      height: 64px !important;
      min-width: 64px;
      min-height: 64px;
    }
  }

  @media (max-width: 1024px) {
    :global(:root[data-layout-page-item="split"]) .item-detail-page {
      grid-template-columns: 1fr !important;
      max-width: 100%;
      width: 100%;
      gap: 0;
    }

    :global(:root[data-layout-page-item="split"]) .item-detail-page .item-detail,
    :global(:root[data-layout-page-item="split"]) .item-detail-page :global(.recommendations) {
      grid-column: 1 !important;
      position: static !important;
      max-width: 100% !important;
      max-height: none !important;
      overflow-y: visible !important;
      margin-top: var(--spacing-xl) !important;
    }
  }

  :global(:root[data-layout-page-item="split"]) .item-detail-page {
  max-width: 1400px;
  grid-template-columns: minmax(0, 1.75fr) minmax(320px, 400px);
  column-gap: clamp(var(--spacing-lg), 4vw, var(--spacing-xl));
  align-items: flex-start;
}

:global(:root[data-layout-page-item="split"]) .item-detail-page .item-detail {
  grid-column: 1;
  /* split 布局：保持卡片样式 */
  background: var(--component-card-default-bg, var(--card-bg));
  border: var(--component-card-default-border, 1px solid var(--border-light));
  border-radius: var(--component-card-default-radius, var(--radius-2xl));
  padding: var(--component-card-default-padding, var(--spacing-2xl));
  box-shadow: var(--component-card-default-shadow, var(--shadow-sm));
  backdrop-filter: var(--component-card-default-backdrop, blur(16px));
  -webkit-backdrop-filter: var(--component-card-default-backdrop, blur(16px));
}

:global(:root[data-layout-page-item="split"]) .item-detail-page :global(.recommendations) {
  grid-column: 2;
  margin-top: 0;
  position: sticky;
  /* header不跟随，从更靠近顶部的位置开始sticky */
  top: var(--spacing-lg);
  max-height: calc(100vh - var(--spacing-lg) * 2);
  overflow-y: auto;
  overflow-x: visible;
  max-width: 400px;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-left: 1px solid var(--border-light);
  margin-left: 0;
  /* 优化滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: var(--border-light) transparent;
}

:global(:root[data-layout-page-item="split"]) .item-detail-page :global(.recommendations)::-webkit-scrollbar {
  width: 6px;
}

:global(:root[data-layout-page-item="split"]) .item-detail-page :global(.recommendations)::-webkit-scrollbar-track {
  background: transparent;
}

:global(:root[data-layout-page-item="split"]) .item-detail-page :global(.recommendations)::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 3px;
}

:global(:root[data-layout-page-item="split"]) .item-detail-page :global(.recommendations)::-webkit-scrollbar-thumb:hover {
  background: var(--border-accent);
}

:global(:root[data-layout-page-item="split"]) .item-detail-page :global(.recommendations) :global(.section-title) {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-sm);
}

:global(:root[data-layout-page-item="split"]) .item-detail-page :global(.recommendations) :global(.section-subtitle) {
  font-size: 0.875rem;
  margin-bottom: var(--spacing-xl);
  line-height: 1.5;
}

:global(:root[data-layout-page-item="split"]) .item-detail-page :global(.recommendations) :global(.recommendation-grid) {
  grid-template-columns: 1fr !important;
  gap: var(--spacing-xl);
  padding: 0;
}

:global(:root[data-layout-page-item="split"]) .item-detail-page :global(.recommendations) :global(.recommendation-grid) :global(.nav-item) {
  margin: 0;
  width: 100%;
  min-width: 0;
}

:global(:root[data-layout-page-item="full"]) .item-detail-page .item-detail {
  max-width: 100%;
}
</style>
