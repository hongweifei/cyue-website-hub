import { browser } from "$app/environment";
import type { ConcreteThemeId } from "./config";
import { validateThemeConfig } from "./config";

/**
 * 使用 Vite 的 import.meta.glob 自动扫描所有主题CSS文件
 * 这样添加新主题时，只需要在 styles/ 目录下添加CSS文件即可
 * 文件名格式：{themeId}.css
 * 
 * 使用 eager: true 预先加载所有 CSS 文件的 URL，避免动态导入问题
 */
// 使用绝对路径从 src 开始，eager 模式预先加载所有 URL
// 注意：不能在路径中使用 ?url，需要使用 query 参数
const themeCSSModules = import.meta.glob<string>(
	"/src/lib/theme/styles/*.css",
	{
		eager: true,
		query: "?url",
		import: "default"
	}
);

/**
 * 从文件路径提取主题ID
 * 例如：/src/lib/theme/styles/harmony.css -> harmony
 */
function extractThemeId(filePath: string): string {
	// 移除查询参数（如果有）
	const pathWithoutQuery = filePath.split("?")[0];
	const fileName = pathWithoutQuery.split("/").pop() || "";
	// 移除 .css 后缀
	return fileName.replace(/\.css$/, "");
}

/**
 * 主题CSS URL映射（eager 模式下直接存储 URL）
 */
const THEME_CSS_URL_MAP = new Map<ConcreteThemeId, string>();

// 初始化主题CSS URL映射（eager 模式下直接获取 URL）
for (const [filePath, cssUrl] of Object.entries(themeCSSModules)) {
	const themeId = extractThemeId(filePath) as ConcreteThemeId;
	if (themeId && cssUrl) {
		THEME_CSS_URL_MAP.set(themeId, cssUrl);
	} else if (import.meta.env.DEV && themeId) {
		console.warn(`[主题系统] 无法获取主题 ${themeId} 的CSS URL，模块内容:`, cssUrl);
	}
}

// 开发环境下输出扫描结果
if (import.meta.env.DEV) {
	if (THEME_CSS_URL_MAP.size === 0) {
		console.warn(`[主题系统] 未扫描到任何主题CSS文件`);
	} else {
		console.log(
			`[主题系统] 扫描到 ${THEME_CSS_URL_MAP.size} 个主题CSS文件:`,
			Array.from(THEME_CSS_URL_MAP.keys()).join(", ")
		);
	}
}

// 在开发环境下验证配置与CSS文件的同步性
if (browser && import.meta.env.DEV) {
	const availableIds = Array.from(THEME_CSS_URL_MAP.keys()).map(id => id as string);
	validateThemeConfig(availableIds);
}

/**
 * 获取所有可用的主题ID（从CSS文件中扫描到的）
 */
export function getAvailableThemeIds(): ConcreteThemeId[] {
	return Array.from(THEME_CSS_URL_MAP.keys());
}

/**
 * 检查主题CSS文件是否存在
 */
export function hasThemeCSS(themeId: ConcreteThemeId): boolean {
	return THEME_CSS_URL_MAP.has(themeId);
}

/**
 * 当前已加载的主题CSS链接元素
 */
let currentThemeLink: HTMLLinkElement | null = null;

/**
 * 动态加载主题CSS文件
 * @param themeId 主题ID
 */
export async function loadThemeCSS(themeId: ConcreteThemeId): Promise<void> {
	if (!browser || typeof document === "undefined") {
		return;
	}

	const cssUrl = THEME_CSS_URL_MAP.get(themeId);
	if (!cssUrl) {
		console.warn(`未找到主题 ${themeId} 的CSS文件。可用主题: ${Array.from(THEME_CSS_URL_MAP.keys()).join(", ")}`);
		return;
	}

	try {

		// 移除之前加载的主题CSS
		if (currentThemeLink) {
			currentThemeLink.remove();
			currentThemeLink = null;
		}

		// 检查是否已经存在相同的CSS链接
		const existingLink = document.getElementById(`theme-${themeId}`);
		if (existingLink) {
			currentThemeLink = existingLink as HTMLLinkElement;
			return;
		}

		// 创建新的link元素
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = cssUrl;
		link.id = `theme-${themeId}`;
		link.setAttribute("data-theme-id", themeId);

		// 等待CSS加载完成
		await new Promise<void>((resolve, reject) => {
			link.onload = () => resolve();
			link.onerror = () => reject(new Error(`Failed to load theme CSS: ${cssUrl}`));
			document.head.appendChild(link);
		});

		currentThemeLink = link;
	} catch (error) {
		console.error(`加载主题 ${themeId} 的CSS失败:`, error);
	}
}

/**
 * 卸载当前主题CSS
 */
export function unloadThemeCSS(): void {
	if (!browser || typeof document === "undefined") {
		return;
	}

	if (currentThemeLink) {
		currentThemeLink.remove();
		currentThemeLink = null;
	}
}

/**
 * 预加载主题CSS（可选，用于提升性能）
 * @param themeId 主题ID
 */
export async function preloadThemeCSS(themeId: ConcreteThemeId): Promise<void> {
	if (!browser || typeof document === "undefined") {
		return;
	}

	const cssUrl = THEME_CSS_URL_MAP.get(themeId);
	if (!cssUrl) {
		return;
	}

	// 检查是否已经加载
	const existingLink = document.getElementById(`theme-${themeId}`);
	if (existingLink) {
		return;
	}

	try {

		// 创建预加载link
		const link = document.createElement("link");
		link.rel = "preload";
		link.as = "style";
		link.href = cssUrl;
		link.setAttribute("data-theme-id", themeId);
		document.head.appendChild(link);
	} catch (error) {
		console.error(`预加载主题 ${themeId} 的CSS失败:`, error);
	}
}

