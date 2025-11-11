<script lang="ts">
	import type { NavGroup as NavGroupType } from '../types';
	import SidebarGroupTreeList from './SidebarGroupTreeList.svelte';
import { countGroupItems } from '../utils/group';

	interface Props {
		group: NavGroupType;
		selectedGroupId: string | null;
		onSelect: (groupId: string) => void;
		level: number;
	}

let { group, selectedGroupId, onSelect, level }: Props = $props();

const handleSelect = (groupId: string) => {
	onSelect(groupId);
};

const totalItemCount = $derived(countGroupItems(group));
const childGroupCount = $derived((group.children ?? []).length);
</script>

<li>
	<button
		class="sidebar-group-btn"
		class:active={selectedGroupId === group.id}
		style={`--tree-level: ${level}`}
		onclick={() => handleSelect(group.id)}
	>
		{#if group.icon}
			<img src={group.icon} alt={group.name} class="sidebar-group-icon" loading="lazy" />
		{:else}
			<span class="sidebar-group-icon placeholder">{group.name.slice(0, 1).toUpperCase()}</span>
		{/if}
		<div class="sidebar-group-content">
			<span class="sidebar-group-name">{group.name}</span>
			<span class="sidebar-group-meta">
				共 {totalItemCount} 个网站{#if childGroupCount > 0} · {childGroupCount} 个子分组{/if}
			</span>
		</div>
		<span class="sidebar-group-count">{totalItemCount}</span>
	</button>
	{#if group.children && group.children.length > 0}
		<SidebarGroupTreeList
			groups={group.children}
			{selectedGroupId}
			{onSelect}
			level={level + 1}
		/>
	{/if}

<style>
	li {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.sidebar-group-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
		padding-left: var(--spacing-md);
		width: 100%;
		text-align: left;
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		border: 1px solid transparent;
		color: var(--text-primary);
		cursor: pointer;
		transition: background var(--transition-base), border var(--transition-base), color var(--transition-base),
			transform var(--transition-fast);
	}

	.sidebar-group-btn:hover {
		background: var(--primary-light);
		border-color: var(--primary-light);
		color: var(--primary-hover);
		transform: translateX(4px);
	}

	.sidebar-group-btn:focus-visible {
		outline: 2px solid var(--primary-color);
		outline-offset: 3px;
	}

	.sidebar-group-btn.active {
		background: var(--primary-color);
		border-color: var(--primary-color);
		color: var(--text-inverse);
	}

	.sidebar-group-icon {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.95rem;
		font-weight: 600;
		background: var(--icon-bg);
		color: var(--primary-color);
	}

	.sidebar-group-icon.placeholder {
		text-transform: uppercase;
	}

	.sidebar-group-btn.active .sidebar-group-icon {
		background: rgba(255, 255, 255, 0.2);
		color: var(--text-inverse);
	}

	.sidebar-group-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
	}

	.sidebar-group-name {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: inherit;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sidebar-group-meta {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.sidebar-group-btn.active .sidebar-group-meta {
		color: rgba(255, 255, 255, 0.85);
	}

	.sidebar-group-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		height: 26px;
		padding: 0 var(--spacing-sm);
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		background: var(--bg-primary);
		color: var(--text-secondary);
		border: 1px solid var(--border-light);
	}

	.sidebar-group-count::after {
		content: '项';
		margin-left: 2px;
		font-size: 0.7rem;
		color: var(--text-tertiary);
	}

	.sidebar-group-btn.active .sidebar-group-count {
		background: rgba(255, 255, 255, 0.18);
		color: var(--text-inverse);
		border-color: rgba(255, 255, 255, 0.24);
	}

	@media (max-width: 768px) {
		.sidebar-group-btn {
			flex-direction: column;
			align-items: flex-start;
			padding: var(--spacing-sm) var(--spacing-md);
			padding-left: var(--spacing-sm);
		}

		.sidebar-group-count {
			align-self: flex-start;
			margin-left: 0;
		}
	}

	@media (max-width: 480px) {
		.sidebar-group-btn {
			padding: var(--spacing-md);
		}
	}
</style>
</li>

