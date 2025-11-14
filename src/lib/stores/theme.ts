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
	type ThemeId
} from "../theme/config";

export type { ThemeId } from "../theme/config";

const STORAGE_KEY = STORAGE_KEYS.THEME;

function createThemeStore() {
	const { subscribe, set, update } = writable<ThemeId>(DEFAULTS.THEME);

	return {
		subscribe,
		set: (value: ThemeId) => {
			const normalized = normalizeTheme(value);
			if (browser) {
				localStorage.setItem(STORAGE_KEY, normalized);
				applyTheme(normalized);
			}
			set(normalized);
		},
		cycle: () => {
			update((current) => {
				const normalized = normalizeTheme(current);
				const index = THEME_SEQUENCE.indexOf(normalized);
				const next = THEME_SEQUENCE[(index + 1) % THEME_SEQUENCE.length];
				if (browser) {
					localStorage.setItem(STORAGE_KEY, next);
					applyTheme(next);
				}
				return next;
			});
		},
		init: () => {
			if (!browser) return;
			const stored = localStorage.getItem(STORAGE_KEY);
			const initial: ThemeId = stored && isStoredTheme(stored) ? normalizeTheme(stored) : DEFAULTS.THEME;
			set(initial);
			applyTheme(initial);
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

	apply(theme: ThemeId): void {
		if (!browser || typeof document === "undefined") return;
		const root = document.documentElement;

		if (theme === "auto") {
			this.setupAutoTheme(root);
			return;
		}

		this.cleanupAutoTheme();
		this.applyThemeClass(root, theme);
	}

	private setupAutoTheme(root: HTMLElement): void {
		if (!browser || typeof window === "undefined") return;

		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

		const applyPreference = (isDark: boolean) => {
			this.applyThemeClass(root, isDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME);
		};

		applyPreference(prefersDark.matches);
		this.cleanupAutoTheme();

		this.mediaQuery = prefersDark;
		this.listener = (event: MediaQueryListEvent) => applyPreference(event.matches);
		this.mediaQuery.addEventListener("change", this.listener);
	}

	private applyThemeClass(root: HTMLElement, theme: ThemeId): void {
		if (!isConcreteTheme(theme)) return;
		const meta = getThemeOption(theme);

		root.dataset.theme = theme;
		root.dataset.themeMode = meta.mode;
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

function applyTheme(theme: ThemeId): void {
	manager.apply(theme);
}

export const theme = createThemeStore();
