import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { STORAGE_KEYS, DEFAULTS } from "../constants";

export type BaseTheme = "light" | "dark";
export type Theme = BaseTheme | "auto";

const STORAGE_KEY = STORAGE_KEYS.THEME;

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(DEFAULTS.THEME);

  return {
    subscribe,
    set: (value: Theme) => {
      const normalized = normalizeTheme(value);
      if (browser) {
        localStorage.setItem(STORAGE_KEY, normalized);
        applyTheme(normalized);
      }
      set(normalized);
    },
    cycle: () => {
      update((current) => {
        const sequence: Theme[] = ["light", "dark", "auto"];
        const index = sequence.indexOf(normalizeTheme(current));
        const next = sequence[(index + 1) % sequence.length];
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
      const initial: Theme = stored && isValidTheme(stored) ? normalizeTheme(stored) : DEFAULTS.THEME;
      set(initial);
      applyTheme(initial);
    },
  };
}

function normalizeTheme(theme: string | Theme): Theme {
  if (theme === "harmony") return "light";
  if (theme === "dark" || theme === "auto") return theme;
  return "light";
}

function isValidTheme(theme: string): theme is Theme | "harmony" {
  return theme === "light" || theme === "dark" || theme === "auto" || theme === "harmony";
}

class ThemeManager {
  private mediaQuery: MediaQueryList | null = null;
  private listener: ((event: MediaQueryListEvent) => void) | null = null;

  apply(theme: Theme): void {
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
      this.applyThemeClass(root, isDark ? "dark" : "light");
    };

    applyPreference(prefersDark.matches);
    this.cleanupAutoTheme();

    this.mediaQuery = prefersDark;
    this.listener = (event: MediaQueryListEvent) => applyPreference(event.matches);
    this.mediaQuery.addEventListener("change", this.listener);
  }

  private applyThemeClass(root: HTMLElement, theme: BaseTheme): void {
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
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

function applyTheme(theme: Theme): void {
  manager.apply(theme);
}

export const theme = createThemeStore();
