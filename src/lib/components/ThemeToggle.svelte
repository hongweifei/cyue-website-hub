<script lang="ts">
	import { theme } from '../stores/theme';
	import type { Theme } from '../stores/theme';

	let currentTheme: Theme = $state('auto');
	
	$effect(() => {
		const unsubscribe = theme.subscribe((value) => {
			currentTheme = value;
		});
		return unsubscribe;
	});

	function handleToggle() {
		// 在 light -> dark -> auto 之间循环
		if (currentTheme === 'light') {
			theme.set('dark');
		} else if (currentTheme === 'dark') {
			theme.set('auto');
		} else {
			theme.set('light');
		}
	}

	function getThemeLabel(): string {
		if (currentTheme === 'light') return '浅色';
		if (currentTheme === 'dark') return '深色';
		return '自动';
	}
</script>

<button class="theme-toggle-btn" onclick={handleToggle} aria-label="切换主题">
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		{#if currentTheme === 'light'}
			<!-- 太阳图标 - 浅色模式 -->
			<circle cx="12" cy="12" r="5" />
			<line x1="12" y1="1" x2="12" y2="3" />
			<line x1="12" y1="21" x2="12" y2="23" />
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
			<line x1="1" y1="12" x2="3" y2="12" />
			<line x1="21" y1="12" x2="23" y2="12" />
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		{:else if currentTheme === 'dark'}
			<!-- 月亮图标 - 深色模式 -->
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		{:else}
			<!-- 自动图标 - 系统模式 -->
			<rect x="2" y="2" width="20" height="20" rx="2" />
			<circle cx="12" cy="12" r="4" />
			<line x1="12" y1="2" x2="12" y2="6" />
			<line x1="12" y1="18" x2="12" y2="22" />
			<line x1="2" y1="12" x2="6" y2="12" />
			<line x1="18" y1="12" x2="22" y2="12" />
		{/if}
	</svg>
	<span>{getThemeLabel()}</span>
</button>

<style>
	.theme-toggle-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--card-bg);
		border: 2px solid var(--border-color);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-base);
		box-shadow: var(--shadow-sm);
	}

	.theme-toggle-btn:hover {
		border-color: var(--primary-color);
		color: var(--primary-color);
		background: var(--primary-light);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.theme-toggle-btn:active {
		transform: translateY(0);
	}

	.theme-toggle-btn svg {
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.theme-toggle-btn {
			font-size: 0.8125rem;
			padding: var(--spacing-xs) var(--spacing-sm);
		}

		.theme-toggle-btn span {
			display: none;
		}
	}
</style>

