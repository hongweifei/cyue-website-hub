<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import SidebarGroupTreeItem from './SidebarGroupTreeItem.svelte';

	interface Props {
		groups: NavGroupType[];
		selectedGroupId: string | null;
		onSelect: (groupId: string) => void;
		level?: number;
	}

	let { groups, selectedGroupId, onSelect, level = 0 }: Props = $props();
</script>

{#if groups.length > 0}
	<ul class="group-tree" class:nested={level > 0}>
		{#each groups as group}
			<SidebarGroupTreeItem
				{group}
				{selectedGroupId}
				{onSelect}
				level={level}
			/>
		{/each}
	</ul>
{/if}

<style>
	.group-tree {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.group-tree.nested {
		margin-left: var(--spacing-md);
		padding-left: var(--spacing-sm);
		border-left: 1px dashed var(--border-light);
		gap: var(--spacing-2xs);
	}

</style>

