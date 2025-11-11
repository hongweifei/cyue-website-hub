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
			{#if group.description}
				<p class="group-description">{group.description}</p>
			{/if}
			<span class="group-count">
				共 {totalItemCount} 个网站{#if hasChildren} · {childGroupCount} 个子分组{/if}
				{#if hasChildren && directItemCount > 0}（直接包含 {directItemCount} 个）{/if}
			</span>
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
		margin-bottom: var(--spacing-2xl);
		animation: fadeIn 0.5s ease;
		margin-left: calc(var(--group-level, 0) * var(--spacing-xl));
		gap: var(--spacing-lg);
	}

	.nav-group.nested {
		margin-bottom: var(--spacing-xl);
	}

	.nav-group.nested .group-header {
		border-left: 2px solid var(--border-light);
		padding-left: var(--spacing-lg);
	}

	.nav-group.nested .group-header::after {
		left: var(--spacing-lg);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
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
		border-bottom: 2px solid var(--border-light);
		position: relative;
	}

	.group-header::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 60px;
		height: 2px;
		background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
		border-radius: var(--radius-sm);
	}

	.group-icon {
		flex-shrink: 0;
		width: 56px;
		height: 56px;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: linear-gradient(135deg, var(--primary-light) 0%, #e0e7ff 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
		border: 2px solid var(--border-light);
		transition: all var(--transition-base);
	}

	.group-header:hover .group-icon {
		transform: scale(1.05) rotate(5deg);
		box-shadow: var(--shadow-md);
	}

	.group-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.group-info {
		flex: 1;
		min-width: 0;
	}

	.group-title {
		font-size: 1.75rem;
		font-weight: 800;
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--text-primary);
		line-height: 1.2;
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

	.group-description {
		font-size: 0.9375rem;
		color: var(--text-secondary);
		margin: 0 0 var(--spacing-sm) 0;
		line-height: 1.6;
	}

	.group-count {
		font-size: 0.8125rem;
		color: var(--text-tertiary);
		background: var(--bg-tertiary);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
		display: inline-block;
		font-weight: 500;
	}

	.nav-items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--spacing-lg);
	}

	@media (max-width: 1024px) {
		.nav-items-grid {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
			gap: var(--spacing-md);
		}
	}

	@media (max-width: 768px) {
		.nav-group {
			margin-bottom: var(--spacing-xl);
		}

		.nav-items-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		.group-header {
			flex-direction: row;
			align-items: center;
		}

		.group-icon {
			width: 48px;
			height: 48px;
		}

		.group-title {
			font-size: 1.5rem;
		}

		.group-description {
			font-size: 0.875rem;
		}
	}

	@media (max-width: 480px) {
		.group-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.nav-group.nested .group-header {
			padding-left: var(--spacing-md);
		}

		.group-title {
			font-size: 1.25rem;
		}

		.group-icon {
			width: 40px;
			height: 40px;
		}
	}
</style>

