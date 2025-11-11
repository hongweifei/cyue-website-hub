import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { STORAGE_KEYS } from '../constants';

const STORAGE_KEY = STORAGE_KEYS.FAVORITES;

function createFavoritesStore() {
	const { subscribe, set, update } = writable<string[]>([]);
	let currentValue: string[] = [];
	
	// 订阅以保持 currentValue 同步
	subscribe((value) => {
		currentValue = value;
	});

	return {
		subscribe,
		init: () => {
			if (browser) {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored) {
					try {
						set(JSON.parse(stored));
					} catch (e) {
						console.error('Failed to parse favorites:', e);
						set([]);
					}
				}
			}
		},
		add: (id: string) => {
			update((favorites) => {
				if (!favorites.includes(id)) {
					const newFavorites = [...favorites, id];
					if (browser) {
						localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
					}
					return newFavorites;
				}
				return favorites;
			});
		},
		remove: (id: string) => {
			update((favorites) => {
				const newFavorites = favorites.filter((f) => f !== id);
				if (browser) {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
				}
				return newFavorites;
			});
		},
		toggle: (id: string) => {
			update((favorites) => {
				const newFavorites = favorites.includes(id)
					? favorites.filter((f) => f !== id)
					: [...favorites, id];
				if (browser) {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
				}
				return newFavorites;
			});
		},
		has: (id: string) => {
			// 使用同步的 currentValue
			return currentValue.includes(id);
		}
	};
}

export const favorites = createFavoritesStore();

