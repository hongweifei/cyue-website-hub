<script lang="ts">
	import { theme } from "../stores/theme";
	import type { Theme } from "../stores/theme";

	const ICONS: Record<"light" | "dark", string> = {
		light: "M5 12a7 7 0 0 1 7-7 7 7 0 0 1 6.93 6.05 5 5 0 1 1-6.36 6.36A7 7 0 0 1 5 12Z",
		dark: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
	};

	let currentTheme: Theme | "harmony" = $state("light");

	$effect(() => {
		const unsubscribe = theme.subscribe((value) => {
			currentTheme = value;
		});
		return unsubscribe;
	});

	function handleToggle() {
		theme.cycle();
	}

	function resolveTheme(value: Theme | "harmony"): Theme {
		if (value === "harmony") return "light";
		return value;
	}

	function getThemeLabel(): string {
		const resolved = resolveTheme(currentTheme);
		if (resolved === "dark") return "深色";
		if (resolved === "auto") return "自动";
		return "浅色";
	}

	function isLight(): boolean {
		return resolveTheme(currentTheme) === "light";
	}

	function isDark(): boolean {
		return resolveTheme(currentTheme) === "dark";
	}

	function isAuto(): boolean {
		return resolveTheme(currentTheme) === "auto";
	}
</script>

<button class="theme-toggle-btn" onclick={handleToggle} aria-label="切换主题">
	<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
		{#if isLight()}
			<path d={ICONS.light} />
			<circle cx="12" cy="12" r="4" />
		{:else if isDark()}
			<path d={ICONS.dark} />
		{:else if isAuto()}
			<rect x="3" y="3" width="18" height="18" rx="5" />
			<circle cx="9" cy="9" r="2" />
			<circle cx="15" cy="15" r="2" />
			<line x1="9" y1="11" x2="9" y2="15" />
			<line x1="15" y1="9" x2="15" y2="13" />
		{/if}
	</svg>
	<span>{getThemeLabel()}</span>
</button>

<style>
	.theme-toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: calc(var(--spacing-xs) * 1.25) var(--spacing-md);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-light);
		border-radius: var(--radius-full);
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		box-shadow: var(--shadow-xs);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	.theme-toggle-btn:hover {
		border-color: var(--border-accent);
		color: var(--primary-color);
		background: var(--primary-lighter);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.theme-toggle-btn:active {
		transform: translateY(0);
		box-shadow: var(--shadow-xs);
	}

	.theme-toggle-btn svg {
		flex-shrink: 0;
		color: var(--primary-color);
	}

	@media (max-width: 768px) {
		.theme-toggle-btn {
			font-size: 0.8rem;
			padding: var(--spacing-xs);
			border: none;
			background: transparent;
			box-shadow: none;
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
			color: var(--text-secondary);
		}

		.theme-toggle-btn span {
			display: none;
		}
	}
</style>

