<script lang="ts">
	interface Props {
		value: string;
		onInput: (value: string) => void;
	}

	let { value, onInput }: Props = $props();
</script>

<div class="search-bar">
	<svg
		class="search-icon"
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
	>
		<circle cx="11" cy="11" r="8" />
		<path d="m21 21-4.35-4.35" />
	</svg>
	<input
		type="text"
		class="search-input component-input-default"
		placeholder="搜索网站名称、标签、分组..."
		value={value}
		oninput={(e) => onInput(e.currentTarget.value)}
	/>
	{#if value}
		<button class="clear-btn component-button-ghost" onclick={() => onInput('')} aria-label="清除搜索">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
	{/if}
</div>

<style>
	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		max-width: 700px;
		margin: 0 auto;
	}

	.search-icon {
		position: absolute;
		left: var(--spacing-lg);
		color: var(--text-tertiary);
		pointer-events: none;
		z-index: 1;
		transition: color var(--transition-base);
	}

	.search-input {
		width: 100%;
		padding-left: 3.5rem;
		font-size: 0.9375rem;
		transform: translateZ(0);
		will-change: box-shadow;
		contain: layout style;
	}

	.search-bar:has(.search-input:focus) .search-icon {
		color: var(--primary-color);
	}

	.clear-btn {
		position: absolute;
		right: var(--spacing-md);
		width: 28px;
		height: 28px;
		z-index: 1;
		will-change: transform;
		contain: layout style paint;
	}

	@media (max-width: 768px) {
		.search-bar {
			max-width: 100%;
		}

		.search-input {
			padding-left: 3rem;
			font-size: 0.9375rem;
			border-radius: var(--component-input-default-radius, var(--radius-xl));
		}

		.search-icon {
			left: var(--spacing-md);
			width: 18px;
			height: 18px;
		}

		.clear-btn {
			right: var(--spacing-sm);
			width: 24px;
			height: 24px;
		}
	}

	@media (max-width: 480px) {
		.search-input {
			font-size: 0.875rem;
			padding: var(--spacing-xs) var(--spacing-sm);
			padding-left: 2.75rem;
		}

		.search-icon {
			width: 16px;
			height: 16px;
		}
	}
</style>

