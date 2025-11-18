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
          </div>
          {#if data.item.info}
            <p class="item-brief">{data.item.info}</p>
          {/if}
          <div class="item-meta">
            <a href="/group/{encodeGroupIdForUrl(data.item.group)}" class="item-group">
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
                  <span class="tag">{tag}</span>
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
          class="visit-btn"
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
      <a href="/group/{encodeGroupIdForUrl(data.item.group)}" class="group-link">
        查看 {data.item.group} 分组下的所有网站 →
      </a>
    </div>
  </article>
  <RelatedRecommendations
    recommendations={data.recommendations}
  />
</div>

<style>
  .item-detail-page {
    padding: 2rem 0 4rem 0;
    max-width: 1000px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .item-header {
    margin-bottom: 2rem;
  }

  .back-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    transition: all var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: calc(var(--spacing-sm) * 0.875) var(--spacing-lg);
    border-radius: var(--radius-full);
    font-weight: 500;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .back-link:hover {
    color: var(--primary-color);
    background: var(--primary-lighter);
    border-color: var(--border-accent);
    transform: translateX(-2px);
    box-shadow: var(--shadow-xs);
  }

  .back-link:active {
    transform: translateX(0);
  }

  .back-link svg {
    flex-shrink: 0;
  }

  .item-detail {
    padding: 0;
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
      max-width: 1200px;
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
    color: var(--text-secondary);
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: calc(var(--spacing-xs) * 0.75) var(--spacing-md);
    background: var(--primary-lighter);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-full);
    font-weight: 500;
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .item-group:hover {
    background: var(--layer-primary-soft);
    border-color: var(--border-accent);
    color: var(--primary-color);
    transform: translateY(-1px);
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
    padding: calc(var(--spacing-xs) * 0.75) var(--spacing-md);
    background: var(--gradient-brand);
    color: var(--text-inverse);
    border-radius: var(--radius-full);
    font-weight: 600;
    box-shadow: var(--shadow-xs);
    transition: all var(--transition-fast);
    border: none;
  }

  .tag:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
    opacity: 0.95;
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
    padding: calc(var(--spacing-md) * 0.875) var(--spacing-2xl);
    background: var(--gradient-brand);
    color: var(--text-inverse);
    text-decoration: none;
    border-radius: var(--radius-full);
    font-weight: 600;
    font-size: 0.9375rem;
    transition: all var(--transition-fast);
    white-space: nowrap;
    box-shadow: var(--shadow-xs);
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    border: none;
  }

  .visit-btn:hover {
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
    opacity: 0.95;
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
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-full);
    cursor: pointer;
    color: var(--text-tertiary);
    transition: all var(--transition-fast);
    flex-shrink: 0;
  }

  .favorite-btn:hover {
    border-color: var(--border-accent);
    color: var(--primary-color);
    background: var(--primary-lighter);
    transform: scale(1.05);
  }

  .favorite-btn.favorited {
    background: var(--gradient-brand);
    border-color: transparent;
    color: var(--text-inverse);
    box-shadow: var(--shadow-xs);
  }

  .favorite-btn.favorited:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-sm);
    opacity: 0.95;
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
    border-top: 1px solid var(--border-light);
  }

  .group-link {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    transition: all var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: calc(var(--spacing-sm) * 0.875) var(--spacing-lg);
    border-radius: var(--radius-full);
    background: var(--primary-lighter);
    border: 1px solid var(--border-accent);
  }

  .group-link:hover {
    color: var(--text-inverse);
    background: var(--gradient-brand);
    border-color: transparent;
    transform: translateX(2px);
    box-shadow: var(--shadow-xs);
  }

  @media (prefers-reduced-motion: reduce) {
    .back-link:hover,
    .back-link:active,
    .tag:hover,
    .visit-btn:hover,
    .favorite-btn:hover,
    .favorite-btn.favorited:hover,
    .group-link:hover {
      transform: none;
      box-shadow: none;
    }
  }

  @media (max-width: 768px) {
    .item-detail-page {
      padding: 0 0 var(--spacing-lg) 0;
      max-width: 100%;
      overflow-x: hidden;
    }

    .item-header {
      margin-bottom: var(--spacing-md);
    }

    .back-link {
      background: transparent;
      border: none;
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
    }

    .back-link:hover {
      background: transparent;
      border: none;
      box-shadow: none;
      transform: translateX(-2px);
    }

    .item-detail {
      background: transparent;
      border: none;
      border-radius: 0;
      padding: 0;
      box-shadow: none;
    }

    .item-detail:hover {
      box-shadow: none;
    }

    .item-detail-header {
      padding-bottom: var(--spacing-lg);
      gap: 1.5rem;
      margin-bottom: var(--spacing-lg);
    }

    .header-main {
      flex-direction: column;
      gap: 1.25rem;
    }

    .icon-wrapper {
      align-self: flex-start;
    }

    .icon-wrapper :global(.site-icon) {
      width: 64px !important;
      height: 64px !important;
      min-width: 64px;
      min-height: 64px;
    }

    .item-name {
      font-size: 1.375rem;
      margin-bottom: var(--spacing-sm);
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }

    .item-brief {
      font-size: 1rem;
      margin-bottom: var(--spacing-md);
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .item-meta {
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
    }

    .item-group {
      font-size: 0.8125rem;
      padding: 0.3125rem 0.625rem;
    }

    .item-tags {
      gap: 0.375rem;
    }

    .tag {
      font-size: 0.8125rem;
      padding: 0.4375rem 0.75rem;
    }

    .tag:hover {
      transform: none;
      box-shadow: none;
    }

    .info-header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .header-actions {
      padding-top: 0.75rem;
    }

    .visit-btn {
      width: 100%;
      padding: 0.875rem var(--spacing-md);
      font-size: 0.875rem;
      justify-content: center;
    }

    .favorite-btn {
      width: 2.25rem;
      height: 2.25rem;
    }

    .visit-btn:hover {
      transform: none;
      box-shadow: var(--shadow-sm);
    }

    .favorite-btn:hover {
      transform: none;
      box-shadow: var(--shadow-sm);
    }

    .favorite-btn.favorited:hover {
      transform: none;
      box-shadow: var(--shadow-sm);
    }

    .item-description {
      margin-top: var(--spacing-lg);
    }

    .description-title {
      font-size: 1.375rem;
      margin-bottom: var(--spacing-md);
      padding-bottom: var(--spacing-sm);
    }

    .item-footer {
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
    }

    .group-link {
      font-size: 0.875rem;
    }

    .group-link:hover {
      transform: none;
    }
  }
</style>
