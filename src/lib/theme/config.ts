export type ThemeMode = "light" | "dark";

export type ConcreteThemeId =
	| "harmony"
	| "harmony-dark"
	| "aqua"
	| "noir"
	| "mono";

export type ThemeId = ConcreteThemeId | "auto";

export interface ThemeOption {
	id: ThemeId;
	label: string;
	description: string;
	mode: ThemeMode | "adaptive";
	family: "system" | "harmony" | "glass" | "neo" | "mono";
	badge?: string;
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

export const THEME_OPTIONS: ThemeOption[] = [
	{
		id: "auto",
		label: "自适应模式",
		description: "跟随系统光暗并智能切换鸿蒙配色",
		mode: "adaptive",
		family: "system",
		badge: "推荐",
		preview: {
			background: "linear-gradient(135deg, #111827, #fdfbff)",
			accent: "linear-gradient(120deg, #2dd4bf, #4f46e5)",
			border: "rgba(79,70,229,.25)"
		},
		features: ["跟随系统", "开机即用"]
	},
	{
		id: "harmony",
		label: "鸿蒙·晨曦",
		description: "官方浅色，柔和玻璃质感",
		mode: "light",
		family: "harmony",
		preview: {
			background: "linear-gradient(135deg, #f5fbff, #dbeafe)",
			accent: "linear-gradient(120deg, #0ea5e9, #6366f1)",
			border: "rgba(14,165,233,.25)"
		},
		features: ["玻璃拟态", "圆角系统"]
	},
	{
		id: "harmony-dark",
		label: "鸿蒙·星辉",
		description: "官方暗色，夜空霓虹渐变",
		mode: "dark",
		family: "harmony",
		preview: {
			background: "linear-gradient(135deg, #0f172a, #111827)",
			accent: "linear-gradient(120deg, #38bdf8, #6366f1)",
			border: "rgba(56,189,248,.35)"
		},
		features: ["夜间护眼", "高对比文本"]
	},

	{
		id: "aqua",
		label: "云上霓虹",
		description: "高饱和玻璃，漂浮渐变背景",
		mode: "light",
		family: "glass",
		preview: {
			background: "linear-gradient(135deg, #ecfeff, #ede9fe)",
			accent: "linear-gradient(120deg, #f472b6, #60a5fa)",
			border: "rgba(244,114,182,.3)"
		},
		features: ["渐变轮廓", "霓虹描边"]
	},
	{
		id: "noir",
		label: "霓虹夜航",
		description: "深色赛博，双色霓虹分层",
		mode: "dark",
		family: "neo",
		preview: {
			background: "linear-gradient(145deg, #050816, #0f172a)",
			accent: "linear-gradient(120deg, #f97316, #22d3ee)",
			border: "rgba(34,211,238,.4)"
		},
		features: ["霓虹描边", "赛博噪点"]
	},
	{
		id: "mono",
		label: "留白手稿",
		description: "极简纸感，衬线排版",
		mode: "light",
		family: "mono",
		preview: {
			background: "linear-gradient(145deg, #fdf4e3, #f5ebe0)",
			accent: "linear-gradient(120deg, #b45309, #92400e)",
			border: "rgba(146,64,14,.25)"
		},
		features: ["纸张纹理", "衬线标题"]
	}
];

export const THEME_GROUPS: ThemeGroup[] = [
	{
		title: "智能模式",
		description: "根据系统光暗自动切换",
		items: ["auto"]
	},
	{
		title: "鸿蒙设计语言",
		description: "官方原子化视觉体系",
		items: ["harmony", "harmony-dark"]
	},
	{
		title: "创意特调",
		description: "突破色彩之外的氛围定制",
		items: ["aqua", "noir", "mono"]
	}
];

export const THEME_SEQUENCE: ThemeId[] = ["auto", "harmony", "harmony-dark", "aqua", "noir", "mono"];

export const DEFAULT_LIGHT_THEME: ConcreteThemeId = "harmony";
export const DEFAULT_DARK_THEME: ConcreteThemeId = "harmony-dark";

export function getThemeOption(id: ThemeId): ThemeOption {
	return (
		THEME_OPTIONS.find((option) => option.id === id) ??
		THEME_OPTIONS[0]
	);
}

export function isConcreteTheme(id: string): id is ConcreteThemeId {
	return id !== "auto" && THEME_OPTIONS.some((option) => option.id === id);
}

export function isThemeId(id: string): id is ThemeId {
	return THEME_OPTIONS.some((option) => option.id === id);
}


