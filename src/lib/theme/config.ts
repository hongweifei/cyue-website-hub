export type ThemeMode = "light" | "dark";

/**
 * 主题ID类型 - 动态生成，基于扫描到的配置文件
 * 注意：ConcreteThemeId 现在是动态的，不再硬编码
 */
export type ConcreteThemeId = string;

export type ThemeId = ConcreteThemeId | "auto";

export interface ThemeOption {
	id: ThemeId;
	label: string;
	description: string;
	mode: ThemeMode | "adaptive";
	family: "system" | "harmony" | "glass" | "neo" | "mono";
	badge?: string;
	order?: number; // 排序字段，数字越小越靠前，未指定则排在最后
	preview: {
		background: string;
		accent: string;
		border: string;
	};
	features: string[];
}

export interface ThemeGroup {
	title: string;
	description?: string;
	items: ThemeId[];
}

/**
 * 使用 Vite 的 import.meta.glob 自动扫描所有主题配置文件
 * 文件名格式：{themeId}.json
 */
// 使用绝对路径从 src 开始，这样 Vite 可以正确解析
const themeConfigModules = import.meta.glob<ThemeOption>(
	"/src/lib/theme/configs/*.json",
	{
		eager: true,
		import: "default"
	}
);

/**
 * 从文件路径提取主题ID
 * 例如：./configs/harmony.json -> harmony
 */
function extractThemeIdFromConfigPath(filePath: string): string {
	const fileName = filePath.split("/").pop() || "";
	// 移除 .json 后缀（如果有查询参数也一起移除）
	return fileName.replace(/\.json(\?.*)?$/, "");
}

/**
 * 动态加载所有主题配置
 */
const loadedThemeConfigs = new Map<ConcreteThemeId, ThemeOption>();

// 初始化主题配置映射
for (const [filePath, config] of Object.entries(themeConfigModules)) {
	const themeId = extractThemeIdFromConfigPath(filePath);
	if (themeId && config) {
		// 确保配置中的ID与文件名一致
		config.id = themeId as ConcreteThemeId;
		loadedThemeConfigs.set(themeId as ConcreteThemeId, config);
	}
}

// 开发环境下输出加载结果
if (import.meta.env.DEV) {
	if (loadedThemeConfigs.size === 0) {
		console.warn(`[主题系统] 未加载到任何主题配置`);
	} else {
		console.log(
			`[主题系统] 加载了 ${loadedThemeConfigs.size} 个主题配置:`,
			Array.from(loadedThemeConfigs.keys()).join(", ")
		);
	}
}

/**
 * "auto" 主题是特殊的系统主题，不依赖CSS文件，需要硬编码
 */
const AUTO_THEME: ThemeOption = {
	id: "auto",
	label: "自适应模式",
	description: "跟随系统光暗并智能切换鸿蒙配色",
	mode: "adaptive",
	family: "system",
	badge: "推荐",
	order: 0, // auto 主题始终排在最前面
	preview: {
		background: "linear-gradient(135deg, #111827, #fdfbff)",
		accent: "linear-gradient(120deg, #2dd4bf, #4f46e5)",
		border: "rgba(79,70,229,.25)"
	},
	features: ["跟随系统", "开机即用"]
};

/**
 * 排序函数：按 order 字段排序，未指定的排在最后
 */
function sortThemesByOrder(a: ThemeOption, b: ThemeOption): number {
	const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
	const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
	if (orderA !== orderB) {
		return orderA - orderB;
	}
	// 如果 order 相同，按 id 字母顺序排序
	return a.id.localeCompare(b.id);
}

/**
 * 所有主题选项（动态加载 + auto主题），按 order 排序
 */
export const THEME_OPTIONS: ThemeOption[] = [
	AUTO_THEME,
	...Array.from(loadedThemeConfigs.values())
].sort(sortThemesByOrder);

/**
 * 主题分组配置
 * 可以根据需要动态生成，或保持静态配置
 * 分组内的主题也按 order 排序
 */
export const THEME_GROUPS: ThemeGroup[] = [
	{
		title: "智能模式",
		description: "根据系统光暗自动切换",
		items: ["auto"]
	},
	{
		title: "鸿蒙设计语言",
		description: "官方原子化视觉体系",
		items: Array.from(loadedThemeConfigs.values())
			.filter(theme => theme.family === "harmony")
			.sort(sortThemesByOrder)
			.map(theme => theme.id)
	},
	{
		title: "创意特调",
		description: "突破色彩之外的氛围定制",
		items: Array.from(loadedThemeConfigs.values())
			.filter(theme => theme.family !== "harmony" && theme.family !== "system")
			.sort(sortThemesByOrder)
			.map(theme => theme.id)
	}
];

/**
 * 主题切换序列（用于循环切换）
 * 自动生成：auto + 所有已加载的主题，按 order 排序
 */
export const THEME_SEQUENCE: ThemeId[] = [
	"auto",
	...Array.from(loadedThemeConfigs.values())
		.sort(sortThemesByOrder)
		.map(theme => theme.id)
];

/**
 * 默认主题（从配置中查找，如果没有则使用第一个）
 */
export const DEFAULT_LIGHT_THEME: ConcreteThemeId = 
	Array.from(loadedThemeConfigs.values())
		.find(theme => theme.mode === "light")?.id || 
	Array.from(loadedThemeConfigs.keys())[0] || 
	"harmony";

export const DEFAULT_DARK_THEME: ConcreteThemeId = 
	Array.from(loadedThemeConfigs.values())
		.find(theme => theme.mode === "dark")?.id || 
	Array.from(loadedThemeConfigs.keys())[0] || 
	"harmony-dark";

export function getThemeOption(id: ThemeId): ThemeOption {
	return (
		THEME_OPTIONS.find((option) => option.id === id) ??
		THEME_OPTIONS[0]
	);
}

export function isConcreteTheme(id: string): id is ConcreteThemeId {
	return id !== "auto" && loadedThemeConfigs.has(id);
}

export function isThemeId(id: string): id is ThemeId {
	return THEME_OPTIONS.some((option) => option.id === id);
}

/**
 * 获取所有已加载的主题ID（不包括auto）
 */
export function getLoadedThemeIds(): ConcreteThemeId[] {
	return Array.from(loadedThemeConfigs.keys());
}

/**
 * 验证主题配置与CSS文件的同步性
 * 在开发环境下检查配置中的主题是否都有对应的CSS文件
 */
export function validateThemeConfig(availableThemeIds: string[]): void {
	if (typeof window === "undefined") {
		// 只在浏览器环境（开发环境）进行验证
		return;
	}

	const configThemeIds = Array.from(loadedThemeConfigs.keys());
	
	const missingCSS = configThemeIds.filter(id => !availableThemeIds.includes(id));
	const missingConfig = availableThemeIds.filter(id => !configThemeIds.includes(id));

	if (missingCSS.length > 0) {
		console.warn(
			`[主题系统] 以下主题在配置中存在，但缺少CSS文件: ${missingCSS.join(", ")}`
		);
	}

	if (missingConfig.length > 0) {
		console.info(
			`[主题系统] 以下CSS文件存在，但未在配置中注册: ${missingConfig.join(", ")}`
		);
	}
}


