export type ThemeMode = "light" | "dark";

/**
 * 主题ID类型 - 动态生成，基于扫描到的配置文件
 * 注意：ConcreteThemeId 现在是动态的，不再硬编码
 */
export type ConcreteThemeId = string;

export type ThemeId = ConcreteThemeId | "auto";

/**
 * 组件类型定义
 */
export type ComponentType =
	| "button"
	| "card"
	| "input"
	| "tag"
	| "link"
	| "badge"
	| "tooltip"
	| "modal"
	| "sidebar"
	| "header";

/**
 * 组件样式变体定义
 * 每个组件可以有多个变体，如 button 可以有 primary, secondary, outline 等
 */
export interface ComponentStyleVariant {
	/** 变体名称，如 "primary", "secondary", "outline" */
	variant: string;
	/** 变体描述（可选，用于文档和开发工具） */
	description?: string;
	/** 样式属性映射（可选，用于类型检查和文档） */
	properties?: Record<string, string>;
}

/**
 * 组件样式配置
 * 定义某个组件在不同主题下的样式变体
 */
export interface ComponentStyleConfig {
	/** 组件类型 */
	component: ComponentType;
	/** 组件描述（可选） */
	description?: string;
	/** 该组件的样式变体列表 */
	variants?: ComponentStyleVariant[];
	/** 默认变体名称（如果不指定，使用第一个变体） */
	defaultVariant?: string;
}

/**
 * 组件样式系统配置
 * 主题可以定义自己的组件样式配置，用于类型检查和文档生成
 * 实际的样式通过 CSS 变量实现，保持低耦合
 */
export interface ComponentStylesConfig {
	/** 组件样式配置列表 */
	components?: ComponentStyleConfig[];
	/** 样式命名空间前缀（默认: "component"） */
	namespace?: string;
}

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
	/** 组件样式配置（可选，用于类型检查和文档） */
	componentStyles?: ComponentStylesConfig;
}

/**
 * 从 CSS 文件中提取的主题元数据
 */
interface CSSThemeMetadata {
	label?: string;
	description?: string;
	mode?: ThemeMode;
	family?: "system" | "harmony" | "glass" | "neo" | "mono";
	order?: number;
	badge?: string;
	preview?: {
		background?: string;
		accent?: string;
		border?: string;
	};
	features?: string[];
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
 * 使用 Vite 的 import.meta.glob 自动扫描所有主题CSS文件（作为文本）
 * 用于从 CSS 变量中提取主题元数据
 */
const themeCSSTextModules = import.meta.glob<string>(
	"/src/lib/theme/styles/*.css",
	{
		eager: true,
		query: "?raw",
		import: "default"
	}
);

/**
 * 从 CSS 文本中解析主题元数据
 * 支持以下 CSS 变量：
 * - --theme-label: 主题名称
 * - --theme-description: 主题描述
 * - --theme-mode: 主题模式 (light/dark)
 * - --theme-family: 主题家族
 * - --theme-order: 排序值（数字）
 * - --theme-badge: 徽章文本
 * - --theme-preview-background: 预览背景
 * - --theme-preview-accent: 预览强调色
 * - --theme-preview-border: 预览边框色
 * - --theme-features: 特性列表（逗号分隔）
 */
function parseCSSThemeMetadata(cssText: string, themeId: string): CSSThemeMetadata {
	const metadata: CSSThemeMetadata = {};
	
	// 匹配 :root[data-theme="themeId"] 或 :root 选择器中的 CSS 变量
	const rootSelector = `:root[data-theme="${themeId}"]`;
	const rootOnlySelector = `:root`;
	
	// 查找包含主题选择器的规则块
	const rootMatch = cssText.match(new RegExp(`${rootSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^{]*\\{([^}]+)\\}`, 's'));
	const rootOnlyMatch = cssText.match(new RegExp(`${rootOnlySelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^{]*\\{([^}]+)\\}`, 's'));
	
	const cssContent = (rootMatch?.[1] || rootOnlyMatch?.[1] || '').trim();
	
	// 解析 CSS 变量
	const varPattern = /--theme-(\w+(?:-\w+)*)\s*:\s*([^;]+);/g;
	let match;
	
	while ((match = varPattern.exec(cssContent)) !== null) {
		const [, varName, value] = match;
		const trimmedValue = value.trim().replace(/^["']|["']$/g, ''); // 移除引号
		
		switch (varName) {
			case 'label':
				metadata.label = trimmedValue;
				break;
			case 'description':
				metadata.description = trimmedValue;
				break;
			case 'mode':
				if (trimmedValue === 'light' || trimmedValue === 'dark') {
					metadata.mode = trimmedValue;
				}
				break;
			case 'family':
				if (['system', 'harmony', 'glass', 'neo', 'mono'].includes(trimmedValue)) {
					metadata.family = trimmedValue as ThemeOption['family'];
				}
				break;
			case 'order':
				const orderNum = parseInt(trimmedValue, 10);
				if (!isNaN(orderNum)) {
					metadata.order = orderNum;
				}
				break;
			case 'badge':
				metadata.badge = trimmedValue;
				break;
			case 'preview-background':
				if (!metadata.preview) metadata.preview = {};
				metadata.preview.background = trimmedValue;
				break;
			case 'preview-accent':
				if (!metadata.preview) metadata.preview = {};
				metadata.preview.accent = trimmedValue;
				break;
			case 'preview-border':
				if (!metadata.preview) metadata.preview = {};
				metadata.preview.border = trimmedValue;
				break;
			case 'features':
				metadata.features = trimmedValue.split(',').map(f => f.trim()).filter(Boolean);
				break;
		}
	}
	
	return metadata;
}

/**
 * 从 CSS 文件提取主题元数据映射
 */
const cssThemeMetadataMap = new Map<ConcreteThemeId, CSSThemeMetadata>();

// 解析所有 CSS 文件中的主题元数据
for (const [filePath, cssText] of Object.entries(themeCSSTextModules)) {
	const fileName = filePath.split("/").pop() || "";
	const themeId = fileName.replace(/\.css(\?.*)?$/, "") as ConcreteThemeId;
	if (themeId && cssText) {
		const metadata = parseCSSThemeMetadata(cssText, themeId);
		if (Object.keys(metadata).length > 0) {
			cssThemeMetadataMap.set(themeId, metadata);
		}
	}
}

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

/**
 * 合并 CSS 元数据和 JSON 配置
 * JSON 配置优先，CSS 元数据作为补充
 */
function mergeThemeConfig(
	cssMetadata: CSSThemeMetadata | undefined,
	jsonConfig: ThemeOption | undefined,
	themeId: ConcreteThemeId
): ThemeOption | null {
	// 如果两者都不存在，返回 null
	if (!cssMetadata && !jsonConfig) {
		return null;
	}
	
	// 如果只有 CSS 元数据，尝试构建完整配置
	if (!jsonConfig && cssMetadata) {
		// 检查是否有足够的信息构建配置
		if (!cssMetadata.label || !cssMetadata.mode) {
			return null; // 缺少必需字段
		}
		
		return {
			id: themeId,
			label: cssMetadata.label,
			description: cssMetadata.description || '',
			mode: cssMetadata.mode,
			family: cssMetadata.family || 'harmony',
			badge: cssMetadata.badge,
			order: cssMetadata.order,
			preview: {
				background: cssMetadata.preview?.background ?? 'transparent',
				accent: cssMetadata.preview?.accent ?? 'transparent',
				border: cssMetadata.preview?.border ?? 'transparent'
			},
			features: cssMetadata.features || []
		};
	}
	
	// 如果只有 JSON 配置，直接使用
	if (jsonConfig && !cssMetadata) {
		jsonConfig.id = themeId;
		return jsonConfig;
	}
	
	// 两者都存在，合并（JSON 优先）
	if (jsonConfig && cssMetadata) {
		return {
			...jsonConfig,
			id: themeId,
			// JSON 中的字段优先，如果 JSON 中没有则使用 CSS 中的
			label: jsonConfig.label || cssMetadata.label || themeId,
			description: jsonConfig.description || cssMetadata.description || '',
			mode: jsonConfig.mode || cssMetadata.mode || 'light',
			family: jsonConfig.family || cssMetadata.family || 'harmony',
			badge: jsonConfig.badge || cssMetadata.badge,
			order: jsonConfig.order ?? cssMetadata.order,
			preview: {
				background: jsonConfig.preview.background || (cssMetadata.preview?.background ?? 'transparent'),
				accent: jsonConfig.preview.accent || (cssMetadata.preview?.accent ?? 'transparent'),
				border: jsonConfig.preview.border || (cssMetadata.preview?.border ?? 'transparent')
			},
			features: jsonConfig.features.length > 0 ? jsonConfig.features : (cssMetadata.features || [])
		};
	}
	
	return null;
}

// 初始化主题配置映射（合并 CSS 和 JSON 配置）
for (const [filePath, jsonConfig] of Object.entries(themeConfigModules)) {
	const themeId = extractThemeIdFromConfigPath(filePath);
	if (themeId) {
		const cssMetadata = cssThemeMetadataMap.get(themeId as ConcreteThemeId);
		const mergedConfig = mergeThemeConfig(cssMetadata, jsonConfig, themeId as ConcreteThemeId);
		if (mergedConfig) {
			loadedThemeConfigs.set(themeId as ConcreteThemeId, mergedConfig);
		}
	}
}

// 处理只有 CSS 文件但没有 JSON 配置的主题
for (const [themeId, cssMetadata] of cssThemeMetadataMap.entries()) {
	if (!loadedThemeConfigs.has(themeId)) {
		const mergedConfig = mergeThemeConfig(cssMetadata, undefined, themeId);
		if (mergedConfig) {
			loadedThemeConfigs.set(themeId, mergedConfig);
		}
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


