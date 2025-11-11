<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import NavGroupSection from './NavGroupSection.svelte';

	interface Props {
		groups: NavGroupType[];
		showDescription?: boolean;
		level: number;
	}

	let { groups, showDescription = false, level }: Props = $props();
</script>

{#if groups.length > 0}
	<div
		class="subgroups"
		data-level={level}
		style={`--child-level: ${level}`}
	>
		{#each groups as child}
			<NavGroupSection group={child} {showDescription} level={level} />
		{/each}
	</div>
{/if}

<style>
	.subgroups {
		position: relative;
		margin-top: var(--spacing-xl);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
		padding-left: calc(var(--spacing-lg) + var(--child-level) * 12px);
		border-left: 2px dashed rgba(148, 163, 184, 0.35);
	}

	.subgroups::before {
		content: '';
		position: absolute;
		left: -2px;
		top: var(--spacing-md);
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
		box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.08);
	}

	@media (max-width: 768px) {
		.subgroups {
			margin-top: var(--spacing-lg);
			gap: var(--spacing-lg);
			padding-left: calc(var(--spacing-md) + var(--child-level) * 10px);
		}
	}

	@media (max-width: 480px) {
		.subgroups {
			border-left-width: 1px;
			gap: var(--spacing-md);
		}
	}
</style>

