<script lang="ts">
	import { favorites } from '../stores/favorites';
	import type { NavItem } from '../types';
	import { useNavigation } from '$lib/hooks/useNavigation';
	import NavItemComponent from './NavItem.svelte';
	import { derived } from 'svelte/store';

	const navigation = useNavigation();

	const favoriteItemsStore = derived([navigation.navItems, favorites], ([$navItems, $favoriteIds]) => {
		const items = $navItems ?? [];
		const ids = $favoriteIds ?? [];
		return items.filter((item) => ids.includes(item.id));
	}, [] as NavItem[]);

	let favoriteItems = $state<NavItem[]>([]);

	$effect(() => {
		const unsubscribe = favoriteItemsStore.subscribe((value) => {
			favoriteItems = value ?? [];
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
				<NavItemComponent {item} showDescription={true} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.favorite-manager {
		padding: 2rem 0;
	}

	.favorite-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 1.5rem 0;
		color: var(--text-primary, #111827);
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--text-secondary, #6b7280);
	}

	.empty-hint {
		font-size: 0.875rem;
		margin-top: 0.5rem;
	}

	.favorite-items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	@media (max-width: 768px) {
		.favorite-items {
			grid-template-columns: 1fr;
		}
	}
</style>

