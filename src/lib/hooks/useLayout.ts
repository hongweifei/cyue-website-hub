import { layout } from '../stores/layout';
import type { LayoutMode } from '../stores/layout';
import { getContext, setContext } from 'svelte';
import { writable, get, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

const LAYOUT_CONTEXT_KEY = Symbol('layout');

interface UseLayoutReturn {
	layoutMode: Writable<LayoutMode>;
	toggleLayout: () => void;
}

/**
 * 布局管理 Hook
 * 封装布局相关的逻辑，减少组件耦合
 * 注意：必须在 Svelte 组件中使用
 */
export function useLayout(): UseLayoutReturn {
	// 尝试从 context 获取，如果没有则创建新的
	let layoutModeStore = getContext<Writable<LayoutMode>>(LAYOUT_CONTEXT_KEY);
	
	if (!layoutModeStore) {
		if (browser) {
			layout.init();
		}
		layoutModeStore = writable<LayoutMode>(browser ? get(layout) : 'sidebar');
		setContext(LAYOUT_CONTEXT_KEY, layoutModeStore);
		
		// 订阅布局变化（仅在浏览器环境）
		if (browser) {
			layout.subscribe((mode) => {
				layoutModeStore.set(mode);
			});
		}
	}

	function toggleLayout(): void {
		if (browser) {
			layout.toggle();
		}
	}

	return {
		layoutMode: layoutModeStore,
		toggleLayout
	};
}

