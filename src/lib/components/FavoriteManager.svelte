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
	}

	.favorite-title {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 var(--spacing-2xl) 0;
		color: var(--text-primary);
		background: var(--gradient-brand);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.empty-state {
		text-align: center;
		padding: var(--component-card-default-padding, var(--spacing-2xl) var(--spacing-lg));
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

	.empty-hint {
		font-size: 0.875rem;
		margin-top: var(--spacing-sm);
		color: var(--component-link-secondary-color, var(--text-tertiary));
	}

	.favorite-items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-xl);
	}

	@media (max-width: 768px) {
		.favorite-items {
			grid-template-columns: 1fr;
		}
	}
</style>

