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
		padding: calc(var(--spacing-xs) * 1.25) var(--spacing-md);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-light);
		border-radius: var(--radius-full);
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		box-shadow: var(--shadow-xs);
	}

	.layout-toggle-btn:hover {
		border-color: var(--border-accent);
		color: var(--primary-color);
		background: var(--primary-lighter);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.layout-toggle-btn:active {
		transform: translateY(0);
		box-shadow: var(--shadow-xs);
	}

	.layout-toggle-btn svg {
		color: currentColor;
	}

	@media (max-width: 768px) {
		.layout-toggle-btn {
			font-size: 0.8125rem;
			padding: var(--spacing-xs) var(--spacing-sm);
			background: transparent;
			border: none;
			box-shadow: none;
			color: var(--text-secondary);
		}

		.layout-toggle-btn span {
			display: none;
		}
	}
</style>

