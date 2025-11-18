import type { ComponentType } from "./config";

/**
 * 组件样式属性类型
 * 定义组件可以使用的样式属性
 */
export type ComponentStyleProperty = 
	| "bg"           // 背景色
	| "bg-hover"     // 悬停背景色
	| "bg-active"    // 激活背景色
	| "color"        // 文字颜色
	| "color-hover"  // 悬停文字颜色
	| "border"       // 边框颜色
	| "border-hover" // 悬停边框颜色
	| "shadow"       // 阴影
	| "shadow-hover" // 悬停阴影
	| "radius"       // 圆角
	| "padding"      // 内边距
	| "gap"          // 间距
	| "opacity"      // 透明度
	| "backdrop"     // 背景模糊
	| "transition";  // 过渡效果

/**
 * 组件样式选项
 */
export interface ComponentStyleOptions {
	/** 组件类型 */
	component: ComponentType;
	/** 变体名称，如 "primary", "secondary", "outline" */
	variant?: string;
	/** 样式属性名称 */
	property: ComponentStyleProperty;
	/** 命名空间前缀（默认: "component"） */
	namespace?: string;
}

/**
 * 生成组件样式 CSS 变量名
 * 
 * 命名规范：--{namespace}-{component}-{variant}-{property}
 * 例如：
 * - --component-button-primary-bg
 * - --component-card-default-shadow
 * - --component-input-focus-border
 * 
 * @param options 组件样式选项
 * @returns CSS 变量名
 */
export function getComponentStyleVar(options: ComponentStyleOptions): string {
	const {
		component,
		variant = "default",
		property,
		namespace = "component"
	} = options;

	// 如果 variant 是 "default"，可以省略（向后兼容）
	const variantPart = variant === "default" ? "" : `-${variant}`;
	
	return `--${namespace}-${component}${variantPart}-${property}`;
}

/**
 * 生成组件样式类名
 * 
 * 命名规范：{namespace}-{component}-{variant}
 * 例如：
 * - component-button-primary
 * - component-card-default
 * - component-input-focus
 * 
 * @param component 组件类型
 * @param variant 变体名称（可选，默认为 "default"）
 * @param namespace 命名空间前缀（默认: "component"）
 * @returns CSS 类名
 */
export function getComponentStyleClass(
	component: ComponentType,
	variant: string = "default",
	namespace: string = "component"
): string {
	return `${namespace}-${component}-${variant}`;
}

/**
 * 获取组件样式的 CSS 变量值（在运行时）
 * 
 * @param options 组件样式选项
 * @param fallback 回退值（如果变量不存在）
 * @returns CSS 变量值或回退值
 */
export function getComponentStyleValue(
	options: ComponentStyleOptions,
	fallback?: string
): string {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return fallback || "";
	}

	const varName = getComponentStyleVar(options);
	const root = document.documentElement;
	const value = getComputedStyle(root).getPropertyValue(varName).trim();

	return value || fallback || "";
}

/**
 * 组件样式工具类
 * 提供便捷的方法来获取组件样式
 */
export class ComponentStyle {
	private namespace: string;

	constructor(namespace: string = "component") {
		this.namespace = namespace;
	}

	/**
	 * 获取 CSS 变量名
	 */
	var(
		component: ComponentType,
		variant: string = "default",
		property: ComponentStyleProperty
	): string {
		return getComponentStyleVar({
			component,
			variant,
			property,
			namespace: this.namespace
		});
	}

	/**
	 * 获取 CSS 类名
	 */
	class(component: ComponentType, variant: string = "default"): string {
		return getComponentStyleClass(component, variant, this.namespace);
	}

	/**
	 * 获取 CSS 变量值（运行时）
	 */
	value(
		component: ComponentType,
		variant: string = "default",
		property: ComponentStyleProperty,
		fallback?: string
	): string {
		return getComponentStyleValue(
			{
				component,
				variant,
				property,
				namespace: this.namespace
			},
			fallback
		);
	}
}

/**
 * 默认组件样式实例
 */
export const componentStyle = new ComponentStyle();

/**
 * 预定义的组件样式辅助函数
 * 提供常用组件的快捷方法
 */
export const componentStyles = {
	button: {
		var: (variant: string = "default", property: ComponentStyleProperty) =>
			componentStyle.var("button", variant, property),
		class: (variant: string = "default") =>
			componentStyle.class("button", variant),
		value: (variant: string = "default", property: ComponentStyleProperty, fallback?: string) =>
			componentStyle.value("button", variant, property, fallback)
	},
	card: {
		var: (variant: string = "default", property: ComponentStyleProperty) =>
			componentStyle.var("card", variant, property),
		class: (variant: string = "default") =>
			componentStyle.class("card", variant),
		value: (variant: string = "default", property: ComponentStyleProperty, fallback?: string) =>
			componentStyle.value("card", variant, property, fallback)
	},
	input: {
		var: (variant: string = "default", property: ComponentStyleProperty) =>
			componentStyle.var("input", variant, property),
		class: (variant: string = "default") =>
			componentStyle.class("input", variant),
		value: (variant: string = "default", property: ComponentStyleProperty, fallback?: string) =>
			componentStyle.value("input", variant, property, fallback)
	},
	tag: {
		var: (variant: string = "default", property: ComponentStyleProperty) =>
			componentStyle.var("tag", variant, property),
		class: (variant: string = "default") =>
			componentStyle.class("tag", variant),
		value: (variant: string = "default", property: ComponentStyleProperty, fallback?: string) =>
			componentStyle.value("tag", variant, property, fallback)
	},
	link: {
		var: (variant: string = "default", property: ComponentStyleProperty) =>
			componentStyle.var("link", variant, property),
		class: (variant: string = "default") =>
			componentStyle.class("link", variant),
		value: (variant: string = "default", property: ComponentStyleProperty, fallback?: string) =>
			componentStyle.value("link", variant, property, fallback)
	}
};

