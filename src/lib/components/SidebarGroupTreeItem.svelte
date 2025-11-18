<script lang="ts">
import type { NavGroup as NavGroupType } from '../types';
import SidebarGroupTreeList from './SidebarGroupTreeList.svelte';
import { countGroupItems } from '../utils/group';

interface Props {
	group: NavGroupType;
	selectedGroupId: string | null;
	onSelect: (groupId: string | null) => void;
	level: number;
}

let { group, selectedGroupId, onSelect, level }: Props = $props();

const handleSelect = (groupId: string) => {
	if (groupId === selectedGroupId) {
		onSelect(null);
		return;
	}
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

</li>

<style>
	li {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	:global(.sidebar-group-btn) {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: calc(var(--spacing-sm) * 0.875) var(--spacing-md);
		width: 100%;
		text-align: left;
		background: var(--component-button-secondary-bg, var(--bg-tertiary));
		border-radius: var(--component-button-secondary-radius, var(--radius-xl));
		border: 1px solid var(--component-button-secondary-border, var(--border-light));
		color: var(--component-button-secondary-color, var(--text-primary));
		cursor: pointer;
		transition: var(
			--component-button-secondary-transition,
			all var(--transition-fast)
		);
		box-shadow: var(--component-button-secondary-shadow, none);
	}

	:global(.sidebar-group-btn:hover) {
		background: var(--component-button-secondary-bg-hover, var(--primary-lighter));
		border-color: var(--component-button-secondary-border-hover, var(--border-accent));
		color: var(--component-button-secondary-color-hover, var(--primary-color));
		transform: translateX(2px);
		box-shadow: var(--component-button-secondary-shadow-hover, var(--shadow-xs));
	}

	:global(.sidebar-group-btn:focus-visible) {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
		border-radius: var(--radius-xl);
	}

	:global(.sidebar-group-btn.active) {
		background: var(--component-button-primary-bg, var(--gradient-brand));
		border-color: transparent;
		color: var(--component-button-primary-color, var(--text-inverse));
		box-shadow: var(--component-button-primary-shadow, var(--shadow-xs));
	}

	:global(.sidebar-group-icon) {
		width: 36px;
		height: 36px;
		border-radius: var(--component-tag-default-radius, var(--radius-lg));
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.95rem;
		font-weight: 600;
		background: var(--component-tag-default-bg, var(--icon-bg));
		color: var(--component-tag-default-color, var(--primary-color));
		border: 1px solid var(--component-tag-default-border, var(--border-light));
		transition: var(--component-tag-default-transition, all var(--transition-fast));
	}

	:global(.sidebar-group-icon.placeholder) {
		text-transform: uppercase;
	}

	:global(.sidebar-group-btn.active .sidebar-group-icon) {
		background: var(--component-tag-primary-bg, var(--chip-contrast-surface));
		color: var(--component-tag-primary-color, var(--text-inverse));
	}

	:global(.sidebar-group-content) {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xs);
	}

	:global(.sidebar-group-name) {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: inherit;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.sidebar-group-meta) {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	:global(.sidebar-group-btn.active .sidebar-group-meta) {
		color: var(--text-inverse);
	}

	:global(.sidebar-group-count) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		height: 26px;
		padding: 0 var(--spacing-sm);
		border-radius: var(--component-badge-default-radius, var(--radius-full));
		font-size: 0.75rem;
		font-weight: 500;
		background: var(--component-badge-default-bg, var(--primary-lighter));
		color: var(--component-badge-default-color, var(--primary-color));
		border: 1px solid var(--component-badge-default-border, var(--border-accent));
	}

	:global(.sidebar-group-count::after) {
		content: '项';
		margin-left: 2px;
		font-size: 0.7rem;
		color: var(--text-tertiary);
	}

	:global(.sidebar-group-btn.active .sidebar-group-count) {
		background: var(--component-badge-primary-bg, var(--chip-contrast-surface-strong));
		color: var(--component-badge-primary-color, var(--text-inverse));
		border-color: var(--component-badge-primary-border, transparent);
	}

	@media (max-width: 768px) {
		:global(.sidebar-group-btn) {
			align-items: flex-start;
			gap: var(--spacing-sm);
			padding: var(--spacing-sm) var(--spacing-md);
		}

		:global(.sidebar-group-name) {
			white-space: normal;
		}

		:global(.sidebar-group-count) {
			margin-left: auto;
			align-self: flex-start;
		}
	}

	@media (max-width: 480px) {
		:global(.sidebar-group-btn) {
			padding: var(--spacing-sm) var(--spacing-md);
		}
	}
</style>
