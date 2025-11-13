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
		class="search-input"
		placeholder="搜索网站名称、标签、分组..."
		value={value}
		oninput={(e) => onInput(e.currentTarget.value)}
	/>
	{#if value}
		<button class="clear-btn" onclick={() => onInput('')} aria-label="清除搜索">
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
		padding: var(--spacing-md) var(--spacing-lg) var(--spacing-md) 3.5rem;
		font-size: 1rem;
		border: 2px solid var(--border-color);
		border-radius: var(--radius-xl);
		background: var(--card-bg);
		color: var(--text-primary);
		transition: all var(--transition-base);
		box-shadow: var(--shadow-sm);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: var(--shadow-md), 0 0 0 3px var(--layer-primary-soft);
		transform: translateY(-2px);
	}

	.search-bar:has(.search-input:focus) .search-icon {
		color: var(--primary-color);
	}

	.clear-btn {
		position: absolute;
		right: var(--spacing-md);
		background: var(--bg-tertiary);
		border: none;
		cursor: pointer;
		padding: var(--spacing-xs);
		color: var(--text-tertiary);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-base);
		border-radius: var(--radius-md);
		width: 28px;
		height: 28px;
		z-index: 1;
	}

	.clear-btn:hover {
		color: var(--text-primary);
		background: var(--primary-light);
		transform: scale(1.1);
	}

	.clear-btn:active {
		transform: scale(0.95);
	}

	@media (max-width: 768px) {
		.search-bar {
			max-width: 100%;
		}

		.search-input {
			padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 3rem;
			font-size: 0.9375rem;
			border-radius: var(--radius-lg);
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
			padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 2.75rem;
		}

		.search-icon {
			width: 16px;
			height: 16px;
		}
	}
</style>

