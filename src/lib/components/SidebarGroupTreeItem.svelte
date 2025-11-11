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
		<span class="sidebar-group-name">{group.name}</span>
		<span class="sidebar-group-count">{countGroupItems(group)}</span>
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
		gap: var(--spacing-2xs);
	}

	.sidebar-group-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		padding-left: calc(var(--spacing-md) + (var(--tree-level, 0) * var(--spacing-lg)));
		background: var(--bg-tertiary);
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-base);
		text-align: left;
		width: 100%;
		position: relative;
	}

	.sidebar-group-btn:hover {
		background: var(--primary-light);
		border-color: var(--primary-color);
		color: var(--primary-color);
		transform: translateX(4px);
	}

	.sidebar-group-btn.active {
		background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
		color: var(--text-inverse);
		border-color: transparent;
		box-shadow: var(--shadow-md);
	}

	.sidebar-group-icon {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
		object-fit: cover;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		font-weight: 600;
		background: var(--primary-light);
		color: var(--primary-color);
	}

	.sidebar-group-btn.active .sidebar-group-icon {
		background: rgba(255, 255, 255, 0.2);
		color: var(--text-inverse);
	}

	.sidebar-group-name {
		flex: 1;
		text-align: left;
	}

	.sidebar-group-count {
		font-size: 0.75rem;
		opacity: 0.7;
		background: rgba(0, 0, 0, 0.1);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
	}

	.sidebar-group-btn.active .sidebar-group-count {
		background: rgba(255, 255, 255, 0.3);
	}

	@media (max-width: 768px) {
		.sidebar-group-btn {
			flex-direction: column;
			align-items: flex-start;
			padding: var(--spacing-sm);
			padding-left: calc(var(--spacing-sm) + (var(--tree-level, 0) * var(--spacing-md)));
		}

		.sidebar-group-name {
			font-size: 0.8125rem;
		}

		.sidebar-group-count {
			position: relative;
			top: auto;
			right: auto;
			align-self: flex-end;
		}
	}
</style>
</li>

