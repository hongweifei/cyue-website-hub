/**
 * 应用常量配置
 */

// LocalStorage 键名
export const STORAGE_KEYS = {
	FAVORITES: 'nav-favorites',
	THEME: 'nav-theme',
	LAYOUT_MODE: 'nav-layout-mode'
} as const;

// 图标加载配置
export const ICON_CONFIG = {
	TIMEOUT: 3000, // 图标加载超时时间（毫秒）
	FALLBACK_SERVICE: 'https://icons.duckduckgo.com/ip3'
} as const;

// 默认值
export const DEFAULTS = {
	THEME: 'auto' as const,
	LAYOUT_MODE: 'sidebar' as const,
	GROUP_ORDER: 999
} as const;

