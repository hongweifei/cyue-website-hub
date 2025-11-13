<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import SidebarGroupTreeList from './SidebarGroupTreeList.svelte';

interface Props {
	groups: NavGroupType[];
	selectedGroupId: string | null;
	onSelect: (groupId: string | null) => void;
}

let { groups, selectedGroupId, onSelect }: Props = $props();
</script>

<SidebarGroupTreeList {groups} {selectedGroupId} {onSelect} level={0} />
