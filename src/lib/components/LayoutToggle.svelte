<script lang="ts">
	import type { LayoutMode } from '../stores/layout';

	interface Props {
		currentMode: LayoutMode;
		onToggle: () => void;
	}

	let { currentMode, onToggle }: Props = $props();
</script>

<button class="layout-toggle-btn component-button-secondary" onclick={onToggle} aria-label="切换布局">
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		{#if currentMode === 'sidebar'}
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<line x1="9" y1="3" x2="9" y2="21" />
		{:else}
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<line x1="3" y1="9" x2="21" y2="9" />
		{/if}
	</svg>
	<span>{currentMode === 'sidebar' ? '侧边栏布局' : '垂直布局'}</span>
</button>

<style>
	.layout-toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.layout-toggle-btn svg {
		color: currentColor;
		transition: transform var(--transition-fast);
	}

	.layout-toggle-btn:hover svg {
		transform: scale(1.05);
	}

	@media (max-width: 768px) {
		.layout-toggle-btn {
			font-size: 0.8125rem;
			padding: var(--component-button-ghost-padding, var(--spacing-xs) var(--spacing-sm));
			--component-button-secondary-bg: var(--component-button-ghost-bg, transparent);
			--component-button-secondary-border: var(--component-button-ghost-border, transparent);
			--component-button-secondary-shadow: none;
			--component-button-secondary-color: var(--component-button-ghost-color, var(--text-secondary));
		}

		.layout-toggle-btn span {
			display: none;
		}
	}
</style>

