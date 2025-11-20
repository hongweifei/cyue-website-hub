<script lang="ts">
	import type { PageData } from './$types';
	import NavGroup from '$lib/components/NavGroup.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{data.group.name} - {data.site?.name}</title>
	<meta name="description" content={`${data.group.name} 分组下的所有网站导航`} />
</svelte:head>

<div class="group-page">
	<div class="group-header">
		<a href="/" class="back-link component-button-secondary" data-sveltekit-preload-data="hover">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			<span>返回首页</span>
		</a>
	</div>
	<NavGroup group={data.group} />
</div>

<style>
	.group-page {
		padding: 1rem 0;
	}

	.group-header {
		margin-bottom: 2rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		text-decoration: none;
		font-size: 0.875rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.back-link:active {
			transform: none;
		}
	}

	.back-link svg {
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.group-header {
			margin-bottom: 1.5rem;
		}
	}

	:global(:root[data-layout-page-group="compact"]) .group-page {
		padding: var(--spacing-md) 0;
	}

	:global(:root[data-layout-page-group="compact"]) .group-header {
		margin-bottom: var(--spacing-md);
	}

	:global(:root[data-layout-page-group="compact"]) .group-header .back-link {
		font-size: 0.875rem;
	}
</style>

