<script lang="ts">
	import type { PageData } from './$types';
	import NavGroup from '$lib/components/NavGroup.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{data.group.name} - 鸽子导航网</title>
	<meta name="description" content={`${data.group.name} 分组下的所有网站导航`} />
</svelte:head>

<div class="group-page">
	<div class="group-header">
		<a href="/" class="back-link" data-sveltekit-preload-data="hover">
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
	<NavGroup group={data.group} showDescription={true} />
</div>

<style>
	.group-page {
		padding: 1rem 0;
	}

	.group-header {
		margin-bottom: 2rem;
	}

	.back-link {
		color: var(--text-secondary, #6b7280);
		text-decoration: none;
		font-size: 0.875rem;
		transition: all 0.2s;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		border-radius: 8px;
		font-weight: 500;
		background: var(--card-bg, #fff);
		border: 1px solid var(--border-color, #e5e7eb);
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	.back-link:hover {
		color: var(--primary-color, #3b82f6);
		background: rgba(59, 130, 246, 0.05);
		border-color: var(--primary-color, #3b82f6);
		transform: translateX(-4px);
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
	}

	.back-link:active {
		transform: translateX(-2px);
	}

	.back-link svg {
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.group-header {
			margin-bottom: 1.5rem;
		}
	}
</style>

