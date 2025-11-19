<script lang="ts">
	import { page } from '$app/state';
	import { get, derived } from 'svelte/store';
	import { favorites } from '../stores/favorites';
	import type { NavItem } from '../types';
	import { useNavigation } from '$lib/hooks/useNavigation';
	import NavItemComponent from './NavItem.svelte';

	const navigation = useNavigation();

	const favoriteItemsStore = derived([navigation.navItems, favorites], ([$navItems, $favoriteIds]) => {
		const items = $navItems ?? [];
		const ids = $favoriteIds ?? [];
		return items.filter((item) => ids.includes(item.id));
	}, [] as NavItem[]);

	let favoriteItems = $state<NavItem[]>([]);
	let favoriteIds = $state<string[]>(get(favorites));
	const siteDomain = $derived(page.data?.site?.domain ?? '');

	$effect(() => {
		const unsubscribe = favoriteItemsStore.subscribe((value) => {
			favoriteItems = value ?? [];
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = favorites.subscribe((ids) => {
			favoriteIds = ids ?? [];
		});
		return unsubscribe;
	});
</script>

<div class="favorite-manager">
	<h2 class="favorite-title">我的收藏</h2>
	{#if favoriteItems.length === 0}
		<div class="empty-state">
			<p>还没有收藏任何网站</p>
			<p class="empty-hint">点击导航项上的 ❤️ 图标即可收藏</p>
		</div>
	{:else}
		<div class="favorite-items">
			{#each favoriteItems as item}
				<NavItemComponent {item} {favoriteIds} siteDomain={siteDomain} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.favorite-manager {
		padding: var(--spacing-xl) 0;
		max-width: 100%;
	}

	.favorite-title {
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 700;
		margin: 0 0 var(--spacing-2xl) 0;
		color: var(--text-primary);
		background: var(--gradient-brand);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1.2;
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-3xl) var(--spacing-xl);
		color: var(--text-secondary);
		background: var(--component-card-default-bg, var(--bg-secondary));
		border-radius: var(--component-card-default-radius, var(--radius-2xl));
		border: 1px dashed var(--component-card-default-border, var(--border-light));
		box-shadow: var(--component-card-default-shadow, var(--shadow-xs));
		backdrop-filter: var(--component-card-default-backdrop, blur(8px));
		-webkit-backdrop-filter: var(--component-card-default-backdrop, blur(8px));
		transition: var(
			--component-card-default-transition,
			border-color var(--transition-fast),
			box-shadow var(--transition-fast),
			background-color var(--transition-fast)
		);
	}

	.empty-state:hover {
		border-color: var(--border-accent);
		box-shadow: var(--component-card-default-shadow-hover, var(--shadow-sm));
		background: var(--component-card-default-bg-hover, var(--surface-glass));
	}

	.empty-state p:first-child {
		font-size: 1.125rem;
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--text-primary);
	}

	.empty-hint {
		font-size: 0.875rem;
		margin: var(--spacing-sm) 0 0 0;
		color: var(--component-link-secondary-color, var(--text-tertiary));
	}

	/* 默认布局：优化网格 */
	.favorite-items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
		gap: var(--spacing-xl);
		align-items: start;
	}

	/* 默认布局：限制 NavItem 最大宽度，避免拉得太宽 */
	.favorite-items :global(.nav-item) {
		max-width: 100%;
	}

	/* compact 布局：紧凑网格 */
	:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items {
		grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
		gap: var(--spacing-lg);
	}

	/* compact 布局：优化 NavItem 在紧凑布局中的显示 */
	:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items :global(.nav-item) {
		padding: var(--spacing-md);
	}

	:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items :global(.nav-item-header) {
		gap: var(--spacing-md);
	}

	:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items :global(.nav-item-header .site-icon) {
		width: 48px;
		height: 48px;
	}

	:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items :global(.nav-item-name) {
		font-size: 1rem;
	}

	:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items :global(.nav-item-brief) {
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	/* masonry 布局：瀑布流 - 使用 CSS columns */
	:global(:root[data-layout-page-favorites="masonry"]) .favorite-manager .favorite-items {
		display: block;
		column-count: 2;
		column-width: 300px;
		column-gap: var(--spacing-xl);
		column-fill: balance;
		width: 100%;
	}

	/* masonry 布局：确保卡片不会被分列 */
	:global(:root[data-layout-page-favorites="masonry"]) .favorite-manager .favorite-items :global(.nav-item) {
		display: inline-block;
		width: 100%;
		break-inside: avoid;
		page-break-inside: avoid;
		margin-bottom: var(--spacing-xl);
		box-sizing: border-box;
		vertical-align: top;
	}

	/* 响应式优化 */
	@media (min-width: 640px) {
		.favorite-items {
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		}

		:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items {
			grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		}

		:global(:root[data-layout-page-favorites="masonry"]) .favorite-manager .favorite-items {
			column-count: 2;
			column-width: 280px;
			column-gap: var(--spacing-lg);
		}
	}

	@media (min-width: 1024px) {
		.favorite-items {
			grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
			gap: var(--spacing-2xl);
		}

		/* 限制默认布局中单个 NavItem 的最大宽度 */
		.favorite-items :global(.nav-item) {
			max-width: 420px;
			justify-self: start;
		}

		:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		}

		:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items :global(.nav-item) {
			max-width: 380px;
		}

		:global(:root[data-layout-page-favorites="masonry"]) .favorite-manager .favorite-items {
			column-count: 3;
			column-width: 300px;
			column-gap: var(--spacing-xl);
		}

		:global(:root[data-layout-page-favorites="masonry"]) .favorite-manager .favorite-items :global(.nav-item) {
			margin-bottom: var(--spacing-xl);
		}
	}

	@media (min-width: 1280px) {
		.favorite-items :global(.nav-item) {
			max-width: 400px;
		}

		:global(:root[data-layout-page-favorites="masonry"]) .favorite-manager .favorite-items {
			column-count: 3;
			column-width: 320px;
			column-gap: var(--spacing-2xl);
		}
	}

	@media (min-width: 1536px) {
		.favorite-items :global(.nav-item) {
			max-width: 420px;
		}

		:global(:root[data-layout-page-favorites="masonry"]) .favorite-manager .favorite-items {
			column-count: 4;
			column-width: 340px;
		}
	}

	/* 移动端优化 */
	@media (max-width: 768px) {
		.favorite-manager {
			padding: var(--spacing-lg) 0;
		}

		.favorite-title {
			margin-bottom: var(--spacing-xl);
		}

		.favorite-items {
			grid-template-columns: 1fr !important;
			gap: var(--spacing-lg);
		}

		:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items {
			grid-template-columns: 1fr !important;
			display: grid !important;
			gap: var(--spacing-lg);
			max-width: 100%;
		}

		:global(:root[data-layout-page-favorites="masonry"]) .favorite-manager .favorite-items {
			column-count: 1 !important;
			column-width: auto !important;
			display: block !important;
		}

		.empty-state {
			padding: var(--spacing-2xl) var(--spacing-lg);
		}
	}

	@media (max-width: 480px) {
		.favorite-manager {
			padding: var(--spacing-md) 0;
		}

		.favorite-title {
			font-size: 1.5rem;
			margin-bottom: var(--spacing-lg);
		}

		.favorite-items {
			gap: var(--spacing-md);
		}

		:global(:root[data-layout-page-favorites="compact"]) .favorite-manager .favorite-items {
			gap: var(--spacing-md);
		}

		:global(:root[data-layout-page-favorites="masonry"]) .favorite-manager .favorite-items :global(.nav-item) {
			margin-bottom: var(--spacing-md);
		}
	}
</style>

