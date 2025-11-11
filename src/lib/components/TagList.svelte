<script lang="ts">
	interface Props {
		tags: string[];
		selectedTags: string[];
		onToggle: (tag: string) => void;
	}

	let { tags, selectedTags, onToggle }: Props = $props();
</script>

<div class="tag-list">
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
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.tag-btn {
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: 0.8125rem;
		border: 1px solid var(--border-light);
		border-radius: 999px;
		background: var(--bg-primary);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-base);
		font-weight: 500;
	}

	.tag-btn:hover {
		border-color: var(--primary-color);
		color: var(--primary-color);
		background: var(--primary-light);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.tag-btn.active {
		background: var(--primary-color);
		color: var(--text-inverse);
		border-color: var(--primary-color);
		transform: translateY(-1px);
	}

	.tag-btn:active {
		transform: translateY(0);
	}

	.clear-tags {
		align-self: flex-start;
		margin-top: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: 0.8125rem;
		background: transparent;
		border: none;
		color: var(--primary-color);
		cursor: pointer;
		transition: all var(--transition-base);
		font-weight: 500;
	}

	.clear-tags:hover {
		text-decoration: underline;
	}

	.clear-tags:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.tag-btn {
			padding: var(--spacing-xs) var(--spacing-sm);
			font-size: 0.75rem;
		}

		.clear-tags {
			font-size: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.tags {
			gap: var(--spacing-xs);
		}

		.tag-btn {
			font-size: 0.75rem;
			padding: var(--spacing-xs) var(--spacing-sm);
		}
	}
</style>

