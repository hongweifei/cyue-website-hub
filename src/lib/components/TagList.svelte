<script lang="ts">
	interface Props {
		tags: string[];
		selectedTags: string[];
		onToggle: (tag: string) => void;
	}

	let { tags, selectedTags, onToggle }: Props = $props();
</script>

<div class="tag-list">
	<h3 class="tag-list-title">标签筛选</h3>
	<div class="tags">
		{#each tags as tag}
			<button
				class="tag-btn"
				class:active={selectedTags.includes(tag)}
				onclick={() => onToggle(tag)}
			>
				{tag}
			</button>
		{/each}
	</div>
	{#if selectedTags.length > 0}
		<button class="clear-tags" onclick={() => selectedTags.forEach(onToggle)}>
			清除筛选
		</button>
	{/if}
</div>

<style>
	.tag-list {
		margin-bottom: var(--spacing-xl);
		background: var(--card-bg);
		padding: var(--spacing-lg);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.tag-list-title {
		font-size: 0.875rem;
		font-weight: 700;
		margin: 0 0 var(--spacing-md) 0;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.tag-list-title::before {
		content: '';
		width: 3px;
		height: 1rem;
		background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
		border-radius: var(--radius-sm);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.tag-btn {
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: 0.875rem;
		border: 2px solid var(--border-color);
		border-radius: var(--radius-md);
		background: var(--card-bg);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-base);
		font-weight: 500;
		box-shadow: var(--shadow-sm);
	}

	.tag-btn:hover {
		border-color: var(--primary-color);
		color: var(--primary-color);
		background: var(--primary-light);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.tag-btn.active {
		background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
		color: var(--text-inverse);
		border-color: transparent;
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
	}

	.tag-btn:active {
		transform: translateY(0);
	}

	.clear-tags {
		margin-top: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: 0.875rem;
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		color: var(--primary-color);
		cursor: pointer;
		transition: all var(--transition-base);
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.clear-tags:hover {
		background: var(--primary-light);
		border-color: var(--primary-color);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.clear-tags:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.tag-list {
			padding: var(--spacing-md);
			margin-bottom: var(--spacing-lg);
		}

		.tag-list-title {
			font-size: 0.8125rem;
			margin-bottom: var(--spacing-sm);
		}

		.tag-btn {
			padding: var(--spacing-xs) var(--spacing-sm);
			font-size: 0.8125rem;
		}

		.clear-tags {
			width: 100%;
			justify-content: center;
			margin-top: var(--spacing-sm);
		}
	}

	@media (max-width: 480px) {
		.tag-list {
			padding: var(--spacing-sm);
		}

		.tags {
			gap: var(--spacing-xs);
		}

		.tag-btn {
			font-size: 0.75rem;
			padding: var(--spacing-xs) var(--spacing-sm);
		}
	}
</style>

