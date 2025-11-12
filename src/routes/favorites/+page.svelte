<script lang="ts">
	import type { PageData } from './$types';
	import FavoriteManager from '$lib/components/FavoriteManager.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>我的收藏 - {data.site?.name}</title>
	<meta name="description" content="查看我收藏的网站" />
</svelte:head>

<FavoriteManager />

