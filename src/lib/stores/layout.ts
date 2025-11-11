import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { STORAGE_KEYS, DEFAULTS } from '../constants';

export type LayoutMode = 'sidebar' | 'vertical';

const STORAGE_KEY = STORAGE_KEYS.LAYOUT_MODE;

function createLayoutStore() {
	const { subscribe, set, update } = writable<LayoutMode>(DEFAULTS.LAYOUT_MODE);

	return {
		subscribe,
		set: (mode: LayoutMode) => {
			if (browser) {
				localStorage.setItem(STORAGE_KEY, mode);
			}
			set(mode);
		},
		toggle: () => {
			update((current) => {
				const newMode = current === 'sidebar' ? 'vertical' : 'sidebar';
				if (browser) {
					localStorage.setItem(STORAGE_KEY, newMode);
				}
				return newMode;
			});
		},
		init: () => {
			// 初始化时从 localStorage 读取
			if (browser) {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored && (stored === 'sidebar' || stored === 'vertical')) {
					set(stored as LayoutMode);
				}
			}
		}
	};
}

export const layout = createLayoutStore();

