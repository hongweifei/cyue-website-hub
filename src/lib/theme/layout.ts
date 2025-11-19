const LAYOUT_ATTRIBUTES = [
	"shell",
	"header",
	"navigation",
	"content",
	"sidebar",
	"cards",
	"density",
	"pageHome",
	"pageFavorites",
	"pageGroup",
	"pageItem"
] as const;

export type LayoutAttribute = (typeof LAYOUT_ATTRIBUTES)[number];

export type LayoutTokens = Record<LayoutAttribute, string>;

export interface ThemeLayoutConfig {
	/** 可选的布局描述 ID，仅用于 data- 标记 */
	profile?: string;
	/** 针对特定布局属性的精细化覆盖 */
	tokens?: Partial<Record<LayoutAttribute, string>>;
}

export interface ResolvedThemeLayout {
	profile: string;
	tokens: LayoutTokens;
}

const DEFAULT_LAYOUT_PROFILE = "default";

const DEFAULT_LAYOUT_TOKENS: LayoutTokens = {
	shell: "constrained",
	header: "floating",
	navigation: "pill",
	content: "sidebar",
	sidebar: "panel",
	cards: "layered",
	density: "comfortable",
	pageHome: "default",
	pageFavorites: "default",
	pageGroup: "default",
	pageItem: "default"
};

export function isLayoutAttribute(value: string): value is LayoutAttribute {
	return LAYOUT_ATTRIBUTES.includes(value as LayoutAttribute);
}

export function mergeLayoutConfig(
	primary?: ThemeLayoutConfig,
	fallback?: ThemeLayoutConfig
): ThemeLayoutConfig | undefined {
	if (!primary && !fallback) {
		return undefined;
	}

	const result: ThemeLayoutConfig = {};

	if (primary?.profile || fallback?.profile) {
		result.profile = primary?.profile ?? fallback?.profile;
	}

	const mergedTokens: Partial<Record<LayoutAttribute, string>> = {
		...(fallback?.tokens ?? {})
	};

	if (primary?.tokens) {
		for (const [key, value] of Object.entries(primary.tokens)) {
			if (value) {
				mergedTokens[key as LayoutAttribute] = value;
			}
		}
	}

	if (Object.keys(mergedTokens).length > 0) {
		result.tokens = mergedTokens;
	}

	return Object.keys(result).length > 0 ? result : undefined;
}

export function resolveLayoutConfig(config?: ThemeLayoutConfig): ResolvedThemeLayout {
	const tokens: LayoutTokens = { ...DEFAULT_LAYOUT_TOKENS };

	if (config?.tokens) {
		for (const [key, value] of Object.entries(config.tokens)) {
			if (value && isLayoutAttribute(key)) {
				tokens[key] = value;
			}
		}
	}

	return {
		profile: config?.profile ?? DEFAULT_LAYOUT_PROFILE,
		tokens
	};
}

export function layoutAttributeToDatasetKey(attribute: LayoutAttribute): string {
	// 将属性名转换为 camelCase 格式，用于 DOMStringMap
	// 例如: shell -> layoutShell, pageHome -> layoutPageHome
	const firstChar = attribute[0].toUpperCase();
	const rest = attribute.slice(1);
	return `layout${firstChar}${rest}`;
}


