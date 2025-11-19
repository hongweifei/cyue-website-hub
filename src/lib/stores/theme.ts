import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { STORAGE_KEYS, DEFAULTS } from "../constants";
import {
	DEFAULT_DARK_THEME,
	DEFAULT_LIGHT_THEME,
	getThemeOption,
	isConcreteTheme,
	isThemeId,
	THEME_SEQUENCE,
	type ThemeId,
	type ThemeOption
} from "../theme/config";
import { layoutAttributeToDatasetKey, resolveLayoutConfig, type LayoutAttribute } from "../theme/layout";
import { loadThemeCSS, unloadThemeCSS } from "../theme/loader";

export type { ThemeId } from "../theme/config";

const STORAGE_KEY = STORAGE_KEYS.THEME;

function createThemeStore() {
	const { subscribe, set, update } = writable<ThemeId>(DEFAULTS.THEME);

	return {
		subscribe,
		set: async (value: ThemeId) => {
			const normalized = normalizeTheme(value);
			if (browser) {
				localStorage.setItem(STORAGE_KEY, normalized);
				await applyTheme(normalized);
			}
			set(normalized);
		},
		cycle: async () => {
			update((current) => {
				const normalized = normalizeTheme(current);
				const index = THEME_SEQUENCE.indexOf(normalized);
				const next = THEME_SEQUENCE[(index + 1) % THEME_SEQUENCE.length];
				if (browser) {
					localStorage.setItem(STORAGE_KEY, next);
					// 异步应用主题，不阻塞状态更新
					applyTheme(next).catch((error) => {
						console.error("应用主题失败:", error);
					});
				}
				return next;
			});
		},
		init: async () => {
			if (!browser) return;
			const stored = localStorage.getItem(STORAGE_KEY);
			const initial: ThemeId = stored && isStoredTheme(stored) ? normalizeTheme(stored) : DEFAULTS.THEME;
			set(initial);
			await applyTheme(initial);
		}
	};
}

function normalizeTheme(theme: string | ThemeId): ThemeId {
	if (theme === "light") return DEFAULT_LIGHT_THEME;
	if (theme === "dark") return DEFAULT_DARK_THEME;
	if (isThemeId(theme)) return theme;
	return DEFAULTS.THEME;
}

function isStoredTheme(theme: string): theme is ThemeId | "light" | "dark" {
	return theme === "light" || theme === "dark" || isThemeId(theme);
}

class ThemeManager {
	private mediaQuery: MediaQueryList | null = null;
	private listener: ((event: MediaQueryListEvent) => void) | null = null;
	private layoutDatasetKeys: string[] = [];

	async apply(theme: ThemeId): Promise<void> {
		if (!browser || typeof document === "undefined") return;
		const root = document.documentElement;

		if (theme === "auto") {
			await this.setupAutoTheme(root);
			return;
		}

		this.cleanupAutoTheme();
		await this.applyThemeClass(root, theme);
	}

	private async setupAutoTheme(root: HTMLElement): Promise<void> {
		if (!browser || typeof window === "undefined") return;

		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

		const applyPreference = async (isDark: boolean) => {
			await this.applyThemeClass(root, isDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME);
		};

		await applyPreference(prefersDark.matches);
		this.cleanupAutoTheme();

		this.mediaQuery = prefersDark;
		this.listener = async (event: MediaQueryListEvent) => {
			await applyPreference(event.matches);
		};
		this.mediaQuery.addEventListener("change", this.listener);
	}

	private async applyThemeClass(root: HTMLElement, theme: ThemeId): Promise<void> {
		if (!isConcreteTheme(theme)) return;
		const meta = getThemeOption(theme);

		// 卸载之前的主题CSS
		unloadThemeCSS();

		// 加载新的主题CSS
		await loadThemeCSS(theme);

		root.dataset.theme = theme;
		root.dataset.themeMode = meta.mode;
		this.applyLayoutProfile(root, meta.layout);
	}

	private applyLayoutProfile(root: HTMLElement, layoutConfig: ThemeOption["layout"]): void {
		this.layoutDatasetKeys.forEach((key) => {
			delete root.dataset[key as keyof DOMStringMap];
		});
		this.layoutDatasetKeys = [];

		const resolved = resolveLayoutConfig(layoutConfig);
		root.dataset.layoutProfile = resolved.profile;

		for (const [attribute, value] of Object.entries(resolved.tokens)) {
			const datasetKey = layoutAttributeToDatasetKey(attribute as LayoutAttribute);
			root.dataset[datasetKey] = value;
			this.layoutDatasetKeys.push(datasetKey);
		}
	}

	private cleanupAutoTheme(): void {
		if (this.mediaQuery && this.listener) {
			this.mediaQuery.removeEventListener("change", this.listener);
		}
		this.mediaQuery = null;
		this.listener = null;
	}
}

const manager = new ThemeManager();

async function applyTheme(theme: ThemeId): Promise<void> {
	await manager.apply(theme);
}

export const theme = createThemeStore();
