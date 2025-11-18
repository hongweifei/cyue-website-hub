<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import NavGroupSection from './NavGroupSection.svelte';

	interface Props {
		group: NavGroupType;
		favoriteIds?: string[];
	}

	let { group, favoriteIds = [] }: Props = $props();
</script>

<NavGroupSection {group} level={0} {favoriteIds} />
