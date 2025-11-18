<script lang="ts">
	import type { LayoutMode } from '../stores/layout';

	interface Props {
		currentMode: LayoutMode;
		onToggle: () => void;
	}

	let { currentMode, onToggle }: Props = $props();
</script>

<button class="layout-toggle-btn" onclick={onToggle} aria-label="切换布局">
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
		padding: var(--component-button-secondary-padding, calc(var(--spacing-xs) * 1.25) var(--spacing-md));
		background: var(--component-button-secondary-bg, var(--bg-tertiary));
		border: 1px solid var(--component-button-secondary-border, var(--border-light));
		border-radius: var(--component-button-secondary-radius, var(--radius-full));
		color: var(--component-button-secondary-color, var(--text-secondary));
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: var(
			--component-button-secondary-transition,
			all var(--transition-fast)
		);
		box-shadow: var(--component-button-secondary-shadow, var(--shadow-xs));
	}

	.layout-toggle-btn:hover {
		border-color: var(--component-button-secondary-border-hover, var(--border-accent));
		color: var(--component-button-secondary-color-hover, var(--primary-color));
		background: var(--component-button-secondary-bg-hover, var(--primary-lighter));
		transform: translateY(-1px);
		box-shadow: var(--component-button-secondary-shadow-hover, var(--shadow-sm));
	}

	.layout-toggle-btn:active {
		transform: translateY(0);
		box-shadow: var(--component-button-secondary-shadow, var(--shadow-xs));
	}

	.layout-toggle-btn svg {
		color: currentColor;
	}

	@media (max-width: 768px) {
		.layout-toggle-btn {
			font-size: 0.8125rem;
			padding: var(--component-button-ghost-padding, var(--spacing-xs) var(--spacing-sm));
			background: var(--component-button-ghost-bg, transparent);
			border: 1px solid var(--component-button-ghost-border, transparent);
			box-shadow: none;
			color: var(--component-button-ghost-color, var(--text-secondary));
		}

		.layout-toggle-btn span {
			display: none;
		}
	}
</style>

