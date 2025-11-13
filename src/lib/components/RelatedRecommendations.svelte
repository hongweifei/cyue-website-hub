<script lang="ts">
  import type { ItemRecommendation } from "$lib/types";
  import { page } from "$app/state";
  import SiteIcon from "$lib/components/SiteIcon.svelte";

  interface Props {
    recommendations?: ItemRecommendation[];
  }

  let { recommendations = [] }: Props = $props();

  const normalizedRecommendations = $derived(recommendations ?? []);
</script>

{#if normalizedRecommendations.length > 0}
  <section class="recommendations">
    <h2 class="section-title">相关推荐</h2>
    <p class="section-subtitle">
      按照标签与分组为你挑选，助你快速发现更多优质网站。
    </p>
    <div class="recommendation-grid">
      {#each normalizedRecommendations as recommendation}
        {@const item = recommendation.item}
        <article class="recommendation-card">
          <a href="/item/{item.id}" class="card-main" data-sveltekit-preload-data="hover">
            <SiteIcon
              item={item}
              size={56}
            />
            <div class="card-content">
              <h3 class="card-title">{item.name}</h3>
              {#if item.info}
                <p class="card-brief">{item.info}</p>
              {/if}
              <div class="card-meta">
                <span class="card-group">分组：{item.group}</span>
                {#if recommendation.commonTags.length > 0}
                  <div class="card-tags" aria-label="关联标签">
                    {#each recommendation.commonTags as tag}
                      <span class="tag">{tag}</span>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          </a>
          <div class="card-actions">
            <a
              href="{item.url}?utm_source={page.data?.site?.domain}&utm_medium=recommendation"
              target="_blank"
              rel="noopener noreferrer"
              class="visit-link"
            >
              访问网站 →
            </a>
          </div>
        </article>
      {/each}
    </div>
  </section>
{/if}

<style>
  .recommendations {
    margin-top: 3rem;
  }

  .section-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: var(--text-primary, #111827);
  }

  .section-subtitle {
    margin: 0 0 1.5rem 0;
    color: var(--text-secondary, #6b7280);
    font-size: 0.95rem;
  }

  .recommendation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .recommendation-card {
    display: flex;
    flex-direction: column;
    background: var(--card-bg, #fff);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .recommendation-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
    border-color: rgba(59, 130, 246, 0.35);
  }

  .card-main {
    display: flex;
    gap: 1rem;
    text-decoration: none;
    padding: 1.25rem 1.25rem 1rem 1.25rem;
    color: inherit;
  }

  .card-content {
    flex: 1;
    min-width: 0;
  }

  .card-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
    line-height: 1.4;
  }

  .card-brief {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    line-height: 1.55;
  }

  .card-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-group {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    background: var(--tag-bg, #f3f4f6);
    color: var(--text-secondary, #6b7280);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tag {
    padding: 0.35rem 0.7rem;
    font-size: 0.75rem;
    color: var(--primary-color, #3b82f6);
    background: rgba(59, 130, 246, 0.12);
    border-radius: 999px;
    font-weight: 500;
  }

  .card-actions {
    padding: 0 1.25rem 1.25rem 1.25rem;
    margin-top: auto;
  }

  .visit-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--primary-color, #3b82f6);
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .visit-link:hover {
    color: var(--primary-hover, #2563eb);
    transform: translateX(4px);
  }

  @media (max-width: 640px) {
    .recommendations {
      margin-top: 2.5rem;
    }

    .recommendation-grid {
      gap: 1rem;
    }

    .card-main {
      padding: 1rem;
    }

    .card-actions {
      padding: 0 1rem 1rem 1rem;
    }
  }
</style>

