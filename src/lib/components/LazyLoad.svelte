<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		children: any;
		threshold?: number;
		rootMargin?: string;
		placeholder?: boolean;
	}

	let { 
		children, 
		threshold = 0.1, 
		rootMargin = '100px',
		placeholder = true 
	}: Props = $props();

	// 在 SSG 环境中，直接显示内容，不使用懒加载
	// 因为 Intersection Observer 在构建时不可用
	let isVisible = $state(true);
	let observer: IntersectionObserver | null = null;
	let element: HTMLElement | null = null;

	// 只在浏览器环境中初始化 Intersection Observer
	onMount(() => {
		// 检查是否在浏览器环境中
		if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
			// 在 SSG 构建时或不支持 Intersection Observer 的浏览器中，直接显示内容
			isVisible = true;
			return;
		}

		// 在浏览器环境中，使用 Intersection Observer 实现懒加载
		isVisible = false;
		observer = new IntersectionObserver((entries) => {
			const entry = entries[0];
			if (entry.isIntersecting) {
				isVisible = true;
				if (observer) {
					observer.disconnect();
					observer = null;
				}
			}
		}, {
			threshold,
			rootMargin
		});

		if (element) {
			observer.observe(element);
		}
	});

	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});
</script>

<div bind:this={element} class="lazy-load-container">
	{#if isVisible}
		{@render children()}
	{:else if placeholder}
		<div class="lazy-load-placeholder"></div>
	{/if}
</div>

<style>
	.lazy-load-container {
		position: relative;
	}

	.lazy-load-placeholder {
		height: 200px;
		background: var(--bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px dashed var(--border-light);
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>