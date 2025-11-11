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
	<div class="subgroups">
		{#each groups as child}
			<NavGroupSection group={child} {showDescription} level={level} />
		{/each}
	</div>
{/if}

<style>
	.subgroups {
		margin-top: var(--spacing-xl);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}
</style>

