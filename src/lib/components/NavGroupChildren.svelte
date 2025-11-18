<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import NavGroupSection from './NavGroupSection.svelte';

	interface Props {
		groups: NavGroupType[];
		level: number;
		favoriteIds?: string[];
		siteDomain?: string;
	}

	let { groups, level, favoriteIds = [] }: Props = $props();
</script>

{#if groups.length > 0}
	<div class="subgroups">
		<div class="subgroups-list">
		{#each groups as child (child.id)}
			<NavGroupSection group={child} level={level} {favoriteIds} />
		{/each}
		</div>
	</div>
{/if}

<style>
	.subgroups {
		margin-top: var(--spacing-2xl);
		border-left: 1px solid var(--component-card-default-border, transparent);
	}

	.subgroups-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xl);
		position: relative;
	}

	.subgroups-list::before {
		content: '';
		position: absolute;
		left: 0;
		top: calc(-1 * var(--spacing-lg));
		width: 100%;
		height: 1px;
		background: var(--component-card-default-border, var(--border-light));
	}

	@media (max-width: 768px) {
		.subgroups {
			margin-top: var(--spacing-xl);
			padding-left: var(--spacing-md);
			border-left: 2px solid var(--component-card-default-border, var(--border-light));
			position: relative;
		}

		.subgroups::before {
			content: '';
			position: absolute;
			left: -2px;
			top: calc(-1 * var(--spacing-md));
			width: 2px;
			height: var(--spacing-md);
			background: var(--component-card-default-border-hover, var(--gradient-brand));
			opacity: 0.6;
		}

		.subgroups-list {
			gap: var(--spacing-xl);
		}

		.subgroups-list::before {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.subgroups {
			margin-top: var(--spacing-lg);
			padding-left: var(--spacing-sm);
			border-left-width: 1.5px;
		}

		.subgroups::before {
			left: -1.5px;
			width: 1.5px;
			top: calc(-1 * var(--spacing-sm));
			height: var(--spacing-sm);
		}

		.subgroups-list {
			gap: var(--spacing-lg);
		}
	}
</style>
