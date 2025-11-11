<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import NavGroupSection from './NavGroupSection.svelte';

	interface Props {
		group: NavGroupType;
		showDescription?: boolean;
	}

	let { group, showDescription = false }: Props = $props();
</script>

<NavGroupSection {group} {showDescription} level={0} />
