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
		background: var(--card-bg);
		border: 1px solid var(--border-light);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		padding-left: calc(var(--spacing-xl) + 16px);
		box-shadow: var(--shadow-sm);
		animation: fadeIn 0.35s ease;
		transition: box-shadow var(--transition-base), transform var(--transition-base);
	}

	.nav-group::before {
		content: '';
		position: absolute;
		left: var(--spacing-md);
		top: var(--spacing-md);
		bottom: var(--spacing-md);
		width: 4px;
		border-radius: var(--radius-sm);
		background: linear-gradient(180deg, var(--primary-color) 0%, #8b5cf6 100%);
		opacity: 0.75;
	}

	.nav-group:hover {
		box-shadow: var(--shadow-lg);
		transform: translateY(-2px);
	}

	.nav-group.nested {
		margin-bottom: var(--spacing-xl);
		background: var(--bg-tertiary);
		border-color: rgba(148, 163, 184, 0.4);
		box-shadow: none;
		padding: var(--spacing-lg);
		padding-left: calc(var(--spacing-lg) + 12px);
	}

	.nav-group.nested::before {
		left: var(--spacing-sm);
		width: 3px;
		opacity: 0.45;
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
		border-bottom: 1px dashed rgba(148, 163, 184, 0.35);
		position: relative;
	}

	.group-header::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -1px;
		width: 140px;
		height: 3px;
		background: linear-gradient(135deg, var(--primary-color) 0%, #60a5fa 50%, #8b5cf6 100%);
		border-radius: var(--radius-sm);
		opacity: 0.3;
	}

	.nav-group.nested .group-header {
		border-bottom: 1px dashed rgba(148, 163, 184, 0.25);
	}

	.nav-group.nested .group-header::after {
		width: 92px;
		opacity: 0.2;
	}

	.group-icon {
		flex-shrink: 0;
		width: 56px;
		height: 56px;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(59, 130, 246, 0.1) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
		border: 2px solid rgba(148, 163, 184, 0.4);
		transition: all var(--transition-base);
	}

	.nav-group.nested .group-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
	}

	.group-header:hover .group-icon {
		transform: scale(1.08) rotate(4deg);
		box-shadow: var(--shadow-md);
		border-color: rgba(99, 102, 241, 0.35);
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
		background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
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
		background: rgba(59, 130, 246, 0.12);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-md);
		border: 1px solid rgba(59, 130, 246, 0.2);
		white-space: nowrap;
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
			margin-bottom: var(--spacing-xl);
			padding: var(--spacing-lg);
			padding-left: calc(var(--spacing-lg) + 12px);
		}

		.nav-group::before {
			left: var(--spacing-sm);
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
	}

	@media (max-width: 480px) {
		.nav-group {
			padding: var(--spacing-md);
			padding-left: calc(var(--spacing-md) + 10px);
		}

		.nav-group.nested {
			padding: var(--spacing-md);
			padding-left: calc(var(--spacing-md) + 8px);
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

