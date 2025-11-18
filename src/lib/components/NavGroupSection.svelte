<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import NavItem from './NavItem.svelte';
	import NavGroupChildren from './NavGroupChildren.svelte';
	import { countGroupItems } from '../utils/group';
	import { encodeGroupIdForUrl } from '../dataLoader';

	interface Props {
		group: NavGroupType;
		level: number;
		favoriteIds?: string[];
	}

	let { group, level, favoriteIds = [] }: Props = $props();

	// 只在明确提供了图标时才显示
	const groupIconUrl = $derived(group.icon || '');
	const childGroups = $derived(group.children ?? []);
	const hasChildren = $derived(childGroups.length > 0);
	const childGroupCount = $derived(childGroups.length);
	const directItemCount = $derived(group.items.length);
	const totalItemCount = $derived(countGroupItems(group));
</script>

<section
	class="nav-group"
	class:nested={level > 0}
	style={`--group-level: ${level}`}
	data-level={level}
	aria-label={`${group.name} 分组`}
>
	<div class="group-header">
		{#if groupIconUrl}
			<div class="group-icon">
				<img
					src={groupIconUrl}
					alt={group.name}
					loading="lazy"
					onerror={(event) => {
						const target = event.currentTarget as HTMLImageElement | null;
						if (target && target.parentElement) {
							target.style.display = 'none';
						}
					}}
				/>
			</div>
		{/if}
		<div class="group-info">
			<h2 class="group-title">
				<a href={`/group/${encodeGroupIdForUrl(group.id)}`} class="group-link">{group.name}</a>
			</h2>
			<div class="group-meta">
				{#if group.description}
					<p class="group-description">{group.description}</p>
				{/if}
				<span class="group-count">
					共 {totalItemCount} 个网站{#if hasChildren} · {childGroupCount} 个子分组{/if}
					{#if hasChildren && directItemCount > 0}（直接包含 {directItemCount} 个）{/if}
				</span>
			</div>
		</div>
	</div>
	{#if group.items.length > 0}
		<div class="nav-items-grid">
			{#each group.items as item (item.id)}
				<NavItem {item} {favoriteIds} />
			{/each}
		</div>
	{/if}
	{#if hasChildren}
		<NavGroupChildren groups={childGroups} level={level + 1} {favoriteIds} />
	{/if}
</section>

<style>
	.nav-group {
		position: relative;
		margin-bottom: var(--spacing-2xl);
		margin-left: calc(var(--group-level, 0) * var(--spacing-xl));
		padding: var(--spacing-xl) 0;
		padding-left: calc(var(--spacing-lg) + 16px);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--border-light);
		border-radius: 0;
		box-shadow: none;
		animation: fadeIn var(--motion-duration-medium) var(--motion-easing-standard);
		/* 优化大量分组渲染 - 使用 content-visibility 懒加载 */
		content-visibility: auto;
		contain-intrinsic-size: 0 400px;
		/* 优化滚动性能 */
		contain: layout style paint;
	}

	.nav-group::before {
		content: '';
		position: absolute;
		left: var(--spacing-sm);
		top: var(--spacing-md);
		bottom: var(--spacing-md);
		width: 2px;
		border-radius: var(--radius-full);
		background: var(--gradient-brand);
		opacity: 0.5;
		transition: opacity var(--transition-fast);
	}

	.nav-group:hover::before {
		opacity: 0.8;
	}

	.nav-group:hover {
		transform: none;
	}

	.nav-group.nested {
		margin-bottom: 0;
		margin-left: 0;
		padding: 0;
		padding-top: var(--spacing-xl);
		border-bottom: 1px solid var(--border-light);
		position: relative;
	}

	.nav-group.nested:first-child {
		padding-top: 0;
	}

	.nav-group.nested::before {
		display: none;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.group-header {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--border-light);
		transition: border-color var(--transition-fast);
	}

	.nav-group:hover .group-header {
		border-bottom-color: var(--border-accent);
	}

	.nav-group.nested .group-header {
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--border-light);
		gap: var(--spacing-md);
	}

	.group-icon {
		flex-shrink: 0;
		width: 56px;
		height: 56px;
		border-radius: var(--component-card-glass-radius, var(--radius-xl));
		overflow: hidden;
		background: var(--component-card-glass-bg, var(--bg-secondary));
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--component-card-glass-shadow, var(--shadow-xs));
		border: 1px solid var(--component-card-glass-border, var(--border-light));
		backdrop-filter: var(--component-card-glass-backdrop, blur(12px));
		-webkit-backdrop-filter: var(--component-card-glass-backdrop, blur(12px));
		/* 优化 transition - 只过渡会变化的属性 */
		transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast);
		/* GPU 加速 */
		transform: translateZ(0);
	}

	.nav-group.nested .group-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-lg);
	}

	.group-header:hover .group-icon {
		transform: scale(1.03) translateZ(0);
		box-shadow: var(--component-card-glass-shadow-hover, var(--shadow-sm));
		border-color: var(--border-accent);
		background: var(--component-card-glass-bg-hover, var(--surface-glass));
	}

	.group-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.group-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.group-title {
		font-size: 1.8rem;
		font-weight: 800;
		margin: 0;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.nav-group.nested .group-title {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.3;
		position: relative;
	}

	@media (min-width: 769px) {
		.nav-group.nested .group-title::before {
			display: none;
		}
	}

	.group-link {
		color: var(--component-link-default-color, var(--text-primary));
		text-decoration: none;
		transition: var(
			--component-link-default-transition,
			color var(--transition-base),
			transform var(--transition-base)
		);
		display: inline-block;
	}

	.group-link:hover {
		color: var(--component-link-default-color-hover, var(--primary-color));
		transform: translateX(4px);
	}

	.group-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		align-items: center;
	}

	.group-description {
		margin: 0;
		font-size: 0.95rem;
		color: var(--text-secondary);
		line-height: 1.6;
		flex: 1 1 220px;
	}

	.nav-group.nested .group-description {
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.group-count {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-2xs);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--component-badge-default-color, var(--primary-color));
		background: var(--component-badge-default-bg, var(--primary-lighter));
		padding: var(--component-badge-default-padding, calc(var(--spacing-xs) * 0.75) var(--spacing-sm));
		border-radius: var(--component-badge-default-radius, var(--radius-full));
		border: 1px solid var(--component-badge-default-border, var(--border-accent));
		white-space: nowrap;
	}

	.nav-group.nested .group-count {
		font-size: 0.75rem;
		padding: var(--component-badge-default-padding, calc(var(--spacing-xs) * 0.5) calc(var(--spacing-sm) * 0.875));
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-group {
			animation: none;
		}


		.group-header:hover .group-icon {
			transform: none;
		}
	}

	.nav-items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--spacing-lg);
		margin-top: var(--spacing-lg);
		/* 优化大量元素渲染 - 使用 content-visibility 懒加载 */
		content-visibility: auto;
		contain-intrinsic-size: 0 400px;
	}

	.nav-group.nested .nav-items-grid {
		margin-top: var(--spacing-lg);
		gap: var(--spacing-lg);
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	}

	@media (max-width: 1024px) {
		.nav-items-grid {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		}
	}

	@media (max-width: 768px) {
		.nav-group {
			margin-left: calc(var(--group-level, 0) * var(--spacing-lg));
			margin-bottom: var(--spacing-lg);
			padding: var(--spacing-md) 0;
		}

		.nav-group::before {
			display: none;
		}

		.nav-group.nested {
			margin-left: 0;
			margin-bottom: 0;
			padding: 0;
			padding-top: var(--spacing-lg);
			position: relative;
		}

		.nav-group.nested:first-child {
			padding-top: 0;
		}

		.nav-group.nested::after {
			content: '';
			position: absolute;
			left: calc(-1 * var(--spacing-md) - 2px);
			top: 0;
			bottom: 0;
			width: 2px;
			background: var(--border-light);
			opacity: 0.3;
		}

		.nav-group.nested .group-header {
			margin-bottom: var(--spacing-md);
			gap: var(--spacing-sm);
			padding-left: var(--spacing-xs);
		}

		.nav-group.nested .group-title {
			font-size: 1.375rem;
		}

		.nav-group.nested .group-title::before {
			content: '└';
			display: inline-block;
			margin-right: var(--spacing-xs);
			color: var(--text-tertiary);
			font-size: 0.9em;
			vertical-align: baseline;
		}

		.nav-group.nested .group-icon {
			width: 40px;
			height: 40px;
		}

		.nav-group.nested .nav-items-grid {
			margin-top: var(--spacing-md);
		}

		.nav-items-grid {
			grid-template-columns: 1fr;
		}

		.group-header {
			flex-direction: row;
			align-items: flex-start;
			gap: var(--spacing-sm);
		}

		.group-title {
			font-size: 1.55rem;
		}

		.nav-group.nested .group-title {
			font-size: 1.35rem;
		}

		.group-meta {
			gap: var(--spacing-xs);
		}

		.group-description {
			font-size: 0.875rem;
			flex-basis: 100%;
		}

		.group-count {
			font-size: 0.75rem;
		}

		.group-icon {
			width: 48px;
			height: 48px;
		}

		.nav-group.nested .group-icon {
			width: 40px;
			height: 40px;
		}

		.group-header:hover .group-icon {
			transform: none;
			box-shadow: none;
		}
	}

	@media (max-width: 480px) {
		.nav-group {
			margin-left: calc(var(--group-level, 0) * var(--spacing-md));
			padding: var(--spacing-sm) 0;
		}

		.nav-group.nested {
			padding: 0;
			padding-top: var(--spacing-md);
			margin-bottom: 0;
		}

		.nav-group.nested:first-child {
			padding-top: 0;
		}

		.nav-group.nested::after {
			left: calc(-1 * var(--spacing-sm) - 1.5px);
			width: 1.5px;
		}

		.nav-group.nested .group-header {
			margin-bottom: var(--spacing-sm);
			padding-bottom: var(--spacing-xs);
			padding-left: var(--spacing-2xs);
		}

		.nav-group.nested .group-title {
			font-size: 1.25rem;
		}

		.nav-group.nested .group-title::before {
			margin-right: calc(var(--spacing-xs) / 2);
			font-size: 0.85em;
		}

		.nav-group.nested .group-icon {
			width: 36px;
			height: 36px;
		}

		.group-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.group-title {
			font-size: 1.35rem;
		}

		.group-meta {
			flex-direction: column;
			align-items: flex-start;
		}

		.group-count {
			align-self: flex-start;
		}
	}
</style>

