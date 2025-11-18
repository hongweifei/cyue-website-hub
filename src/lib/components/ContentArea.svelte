<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { get } from 'svelte/store';
	import type { NavItem as NavItemType, NavGroup as NavGroupType } from '../types';
	import NavGroup from './NavGroup.svelte';
	import NavItem from './NavItem.svelte';
	import { favorites } from '../stores/favorites';

	interface Props {
		showFilteredResults: boolean;
		filteredItems: NavItemType[];
		currentGroup: NavGroupType | null;
		allGroups: NavGroupType[];
	}

	let { showFilteredResults, filteredItems, currentGroup, allGroups }: Props = $props();

	let favoriteIds = $state<string[]>(browser ? get(favorites) : []);
	const siteDomain = $derived(page.data?.site?.domain ?? '');

	if (browser) {
		$effect(() => {
			const unsubscribe = favorites.subscribe((ids) => {
				favoriteIds = ids ?? [];
			});
			return unsubscribe;
		});
	}
</script>

<main class="content-area">
	{#if showFilteredResults}
		<div class="results-section">
			<h2 class="results-title">
				搜索结果 ({filteredItems.length})
			</h2>
			{#if filteredItems.length === 0}
				<div class="no-results">
					<p>没有找到匹配的网站</p>
				</div>
			{:else}
				<div class="results-grid">
					{#each filteredItems as item (item.id)}
						<NavItem {item} {favoriteIds} siteDomain={siteDomain} />
					{/each}
				</div>
			{/if}
		</div>
	{:else if currentGroup}
		<div class="group-content">
			<NavGroup group={currentGroup} {favoriteIds} />
		</div>
	{:else}
		<!-- 显示全部分组 -->
		<div class="all-groups-content">
			{#each allGroups as group (group.id)}
				<NavGroup {group} {favoriteIds} />
			{/each}
		</div>
	{/if}
</main>

<style>
	.content-area {
		min-width: 0;
	}

	.results-section {
		margin-bottom: var(--spacing-xl);
		animation: fadeIn var(--motion-duration-medium) var(--motion-easing-standard);
	}

	.group-content {
		animation: fadeIn var(--motion-duration-medium) var(--motion-easing-standard);
	}

	.all-groups-content {
		animation: fadeIn var(--motion-duration-slow) var(--motion-easing-standard);
		/* 使用content-visibility优化已在NavGroupSection中实现 */
		contain: layout style;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.results-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 var(--spacing-lg) 0;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		background: var(--gradient-brand);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.results-title::before {
		content: '';
		width: 3px;
		height: 1.5rem;
		background: var(--gradient-brand);
		border-radius: var(--radius-full);
	}

	.no-results {
		text-align: center;
		padding: var(--component-card-default-padding, var(--spacing-2xl) var(--spacing-md));
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

	.no-results:hover {
		border-color: var(--border-accent);
		box-shadow: var(--component-card-default-shadow-hover, var(--shadow-sm));
		background: var(--component-card-default-bg-hover, var(--surface-glass));
	}

	.no-results p {
		font-size: 1.125rem;
		margin: 0;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--spacing-lg);
		/* 优化大量元素渲染 - 使用 content-visibility 懒加载 */
		content-visibility: auto;
		contain-intrinsic-size: 0 400px;
	}

	@media (max-width: 1024px) {
		.results-grid {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
			gap: var(--spacing-md);
		}
	}

	@media (max-width: 768px) {
		.results-section {
			margin-bottom: var(--spacing-lg);
		}

		.results-title {
			font-size: 1.25rem;
			margin-bottom: var(--spacing-md);
		}

		.results-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		.no-results {
			padding: var(--spacing-xl) var(--spacing-md);
		}
	}

	@media (max-width: 480px) {
		.results-title {
			font-size: 1.125rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.results-section,
		.group-content,
		.all-groups-content {
			animation: none;
		}
	}
</style>

