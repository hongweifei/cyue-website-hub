import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { STORAGE_KEYS, DEFAULTS } from '../constants';

export type Theme = 'light' | 'dark' | 'auto';

const STORAGE_KEY = STORAGE_KEYS.THEME;

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>(DEFAULTS.THEME);

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem(STORAGE_KEY, theme);
				applyTheme(theme);
			}
			set(theme);
		},
		toggle: () => {
			update((current) => {
				// 在 light 和 dark 之间切换，跳过 auto
				const newTheme = current === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem(STORAGE_KEY, newTheme);
					applyTheme(newTheme);
				}
				return newTheme;
			});
		},
		init: () => {
			if (browser) {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored && (stored === 'light' || stored === 'dark' || stored === 'auto')) {
					const theme = stored as Theme;
					set(theme);
					applyTheme(theme);
				} else {
					// 如果没有存储的主题，使用系统偏好
					set(DEFAULTS.THEME);
					applyTheme(DEFAULTS.THEME);
				}
			}
		}
	};
}

// 主题管理器，封装 DOM 操作
class ThemeManager {
	private mediaQuery: MediaQueryList | null = null;
	private handleChange: ((e: MediaQueryListEvent) => void) | null = null;

	apply(theme: Theme): void {
		if (!browser || typeof document === 'undefined') return;

		const root = document.documentElement;
		
		if (theme === 'auto') {
			this.setupAutoTheme(root);
		} else {
			this.cleanupAutoTheme();
			root.classList.toggle('dark', theme === 'dark');
		}
	}

	private setupAutoTheme(root: HTMLElement): void {
		if (!browser || typeof window === 'undefined') return;

		// 检测系统偏好
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		root.classList.toggle('dark', prefersDark);
		
		// 清理旧的监听器
		this.cleanupAutoTheme();
		
		// 监听系统主题变化
		this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		this.handleChange = (e: MediaQueryListEvent) => {
			root.classList.toggle('dark', e.matches);
		};
		
		this.mediaQuery.addEventListener('change', this.handleChange);
	}

	private cleanupAutoTheme(): void {
		if (this.mediaQuery && this.handleChange) {
			this.mediaQuery.removeEventListener('change', this.handleChange);
			this.mediaQuery = null;
			this.handleChange = null;
		}
	}
}

const themeManager = new ThemeManager();

function applyTheme(theme: Theme): void {
	themeManager.apply(theme);
}

export const theme = createThemeStore();

