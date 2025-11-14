<script lang="ts">
  import type { PageData } from "./$types";
  import { favorites } from "$lib/stores/favorites";
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
      <SiteIcon
        item={data.item}
        size={96}
        appearance="muted"
        radius={16}
      />
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
  <RelatedRecommendations
    recommendations={data.recommendations}
  />
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
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    transition:
      color var(--transition-fast),
      background var(--transition-fast),
      border-color var(--transition-fast),
      transform var(--transition-fast),
      box-shadow var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: var(--radius-md);
    font-weight: 500;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .back-link:hover {
    color: var(--primary-color);
    background: var(--layer-primary-soft);
    border-color: var(--primary-color);
    transform: translateX(-4px);
    box-shadow: var(--shadow-sm);
  }

  .back-link:active {
    transform: translateX(-2px);
  }

  .back-link svg {
    flex-shrink: 0;
  }

  .item-detail {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition-base);
  }

  .item-detail:hover {
    box-shadow: var(--shadow-md);
  }

  .item-detail-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    align-items: flex-start;
  }

  .item-info {
    flex: 1;
    min-width: 0;
  }

  .item-name {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .item-brief {
    font-size: 1.125rem;
    color: var(--text-secondary);
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
    color: var(--text-secondary);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: var(--tag-bg);
    border-radius: var(--radius-md);
  }

  .item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    font-size: 0.875rem;
    padding: 0.5rem 0.875rem;
    background: var(--gradient-brand);
    color: var(--text-inverse);
    border-radius: var(--radius-md);
    font-weight: 500;
    box-shadow: var(--shadow-sm);
    transition:
      transform var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .tag:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-end;
  }

  .visit-btn {
    padding: 0.875rem 2rem;
    background: var(--gradient-brand);
    color: var(--text-inverse);
    text-decoration: none;
    border-radius: var(--radius-lg);
    font-weight: 600;
    transition:
      background var(--transition-base),
      box-shadow var(--transition-base),
      transform var(--transition-base),
      color var(--transition-base);
    white-space: nowrap;
    box-shadow: var(--shadow-md);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .visit-btn:hover {
    background: linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-color-strong) 100%);
    box-shadow: var(--shadow-glow);
    transform: translateY(-2px);
  }

  .favorite-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.25rem;
    background: var(--tag-bg);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
    cursor: pointer;
    color: var(--text-secondary);
    transition:
      background var(--transition-base),
      color var(--transition-base),
      box-shadow var(--transition-base),
      transform var(--transition-base),
      border-color var(--transition-base);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .favorite-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--layer-primary-soft);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .favorite-btn.favorited {
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
    border-color: var(--accent-color);
    color: var(--text-inverse);
    box-shadow: var(--shadow-sm);
  }

  .favorite-btn.favorited:hover {
    background: linear-gradient(135deg, var(--accent-hover) 0%, var(--accent-color) 100%);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .item-description {
    margin-top: 2.5rem;
    padding-top: 2.5rem;
    border-top: 2px solid var(--border-color);
  }

  .description-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: var(--text-primary);
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-color);
  }

  .item-footer {
    margin-top: 2.5rem;
    padding-top: 2rem;
    border-top: 2px solid var(--border-color);
  }

  .group-link {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    transition:
      color var(--transition-fast),
      transform var(--transition-fast),
      box-shadow var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .group-link:hover {
    color: var(--primary-hover);
    text-decoration: underline;
    transform: translateX(4px);
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
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-lg);
    }

    .item-detail-header :global(.site-icon) {
      width: 64px !important;
      height: 64px !important;
      min-width: 64px;
      min-height: 64px;
      align-self: flex-start;
      flex-shrink: 0;
    }

    .item-name {
      font-size: 1.375rem;
      margin-bottom: var(--spacing-sm);
    }

    .item-brief {
      font-size: 1rem;
      margin-bottom: var(--spacing-md);
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

    .item-actions {
      width: 100%;
      flex-direction: row;
      justify-content: stretch;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
    }

    .visit-btn,
    .favorite-btn {
      flex: 1;
      padding: 0.75rem var(--spacing-md);
      font-size: 0.875rem;
      justify-content: center;
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
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--border-color);
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
