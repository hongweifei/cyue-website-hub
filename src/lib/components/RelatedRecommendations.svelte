<script lang="ts">
  import type { ItemRecommendation } from "$lib/types";
  import { page } from "$app/state";
  import NavItem from "./NavItem.svelte";
  import { favorites } from "../stores/favorites";
  import { get } from "svelte/store";
  import { browser } from "$app/environment";

  interface Props {
    recommendations?: ItemRecommendation[];
  }

  let { recommendations = [] }: Props = $props();

  const normalizedRecommendations = $derived(recommendations ?? []);
  
  let favoriteIds = $state<string[]>(browser ? get(favorites) : []);

  if (browser) {
    $effect(() => {
      const unsubscribe = favorites.subscribe((favs) => {
        favoriteIds = favs;
      });
      return unsubscribe;
    });
  }
</script>

{#if normalizedRecommendations.length > 0}
  <section class="recommendations">
    <h2 class="section-title">相关推荐</h2>
    <p class="section-subtitle">
      按照标签与分组为你挑选，助你快速发现更多优质网站。
    </p>
    <div class="recommendation-grid">
      {#each normalizedRecommendations as recommendation}
        <NavItem 
          item={recommendation.item} 
          {favoriteIds}
          siteDomain={page.data?.site?.domain}
        />
      {/each}
    </div>
  </section>
{/if}

<style>
  .recommendations {
    margin-top: 0;
  }

  @media (min-width: 1280px) {
    .recommendations {
      margin-top: 0;
    }

    .section-title {
      font-size: 1.75rem;
    }

    .section-subtitle {
      font-size: 0.9375rem;
    }

    .recommendation-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.75rem;
    }
  }

  @media (min-width: 1600px) {
    .recommendations {
      margin-top: 0;
    }

    .section-title {
      font-size: 2rem;
    }

    .recommendation-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  }

  .section-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: var(--component-link-secondary-color, var(--text-primary));
    text-decoration: none;
  }

  .section-subtitle {
    margin: 0 0 1.5rem 0;
    color: var(--component-link-secondary-color, var(--text-secondary));
    font-size: 0.95rem;
  }

  .recommendation-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1.5rem;
  }

  @media (min-width: 640px) {
    .recommendation-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .recommendation-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .recommendations {
      margin-top: var(--spacing-xl);
    }

    .section-title {
      font-size: 1.375rem;
      margin-bottom: var(--spacing-sm);
    }

    .section-subtitle {
      font-size: 0.875rem;
      margin-bottom: var(--spacing-md);
    }

    .recommendation-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }

  @media (max-width: 640px) {
    .recommendations {
      margin-top: var(--spacing-lg);
    }
  }
</style>

