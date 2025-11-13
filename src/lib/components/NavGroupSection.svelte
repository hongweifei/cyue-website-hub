<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import NavItem from './NavItem.svelte';
	import NavGroupChildren from './NavGroupChildren.svelte';
	import { countGroupItems } from '../utils/group';

	interface Props {
		group: NavGroupType;
		showDescription?: boolean;
		level: number;
	}

	let { group, showDescription = false, level }: Props = $props();

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
				<a href={`/group/${group.id}`} class="group-link">{group.name}</a>
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
			{#each group.items as item}
				<NavItem {item} {showDescription} />
			{/each}
		</div>
	{/if}
	{#if hasChildren}
		<NavGroupChildren groups={childGroups} {showDescription} level={level + 1} />
	{/if}
</section>

<style>
	.nav-group {
		position: relative;
		margin-bottom: var(--spacing-2xl);
		margin-left: calc(var(--group-level, 0) * var(--spacing-xl));
		padding: var(--spacing-xl) 0;
		padding-left: calc(var(--spacing-lg) + 18px);
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--border-light);
		border-radius: 0;
		box-shadow: none;
		animation: fadeIn var(--motion-duration-medium) var(--motion-easing-standard);
	}

	.nav-group::before {
		content: '';
		position: absolute;
		left: var(--spacing-sm);
		top: var(--spacing-md);
		bottom: var(--spacing-md);
		width: 3px;
		border-radius: var(--radius-sm);
		background: var(--gradient-brand);
		opacity: 0.6;
	}

	.nav-group:hover {
		transform: none;
	}

	.nav-group.nested {
		margin-bottom: var(--spacing-xl);
		padding: var(--spacing-lg) 0;
		padding-left: calc(var(--spacing-lg) + 14px);
		border-bottom: none;
	}

	.nav-group.nested::before {
		left: var(--spacing-xs);
		width: 2px;
		background: var(--border-soft);
		opacity: 0.6;
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
	}

	.nav-group.nested .group-header {
		border-bottom: 1px solid var(--border-light);
	}

	.group-icon {
		flex-shrink: 0;
		width: 56px;
		height: 56px;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--border-light);
		transition: all var(--transition-base);
	}

	.nav-group.nested .group-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
	}

	.group-header:hover .group-icon {
		transform: scale(1.05);
		box-shadow: var(--shadow-sm);
		border-color: var(--border-accent);
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
		font-size: 1.55rem;
	}

	.group-link {
		color: var(--text-primary);
		text-decoration: none;
		transition: all var(--transition-base);
		display: inline-block;
		background: var(--gradient-brand);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.group-link:hover {
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

	.group-count {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-2xs);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--primary-color);
		background: var(--layer-primary-soft);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-accent);
		white-space: nowrap;
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
	}

	.nav-group.nested .nav-items-grid {
		margin-top: var(--spacing-md);
		gap: var(--spacing-md);
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
			padding-left: calc(var(--spacing-md) + 10px);
		}

		.nav-group::before {
			display: none;
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
			padding: var(--spacing-sm) 0;
			padding-left: calc(var(--spacing-sm) + 6px);
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

