import { ICON_CONFIG } from '../constants';

/**
 * 从网站 URL 获取图标
 * 优先从网站根目录获取 favicon，不依赖第三方服务
 */

/**
 * 从 URL 中提取域名和基础 URL
 */
function extractUrlInfo(url: string): { domain: string; baseUrl: string } | null {
	try {
		const urlObj = new URL(url);
		return {
			domain: urlObj.hostname.replace(/^www\./, ''),
			baseUrl: `${urlObj.protocol}//${urlObj.hostname}`
		};
	} catch (e) {
		// 如果 URL 格式不正确，尝试简单提取
		const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
		if (match) {
			const domain = match[1];
			return {
				domain,
				baseUrl: url.startsWith('http') ? url.split('/').slice(0, 3).join('/') : `https://${domain}`
			};
		}
		return null;
	}
}

/**
 * 获取网站的 favicon URL
 * 优先尝试从网站根目录获取（最常见的 favicon.ico）
 * 这是网站通常放置 favicon 的标准位置
 */
export function getFaviconUrl(url: string): string {
	if (!url) return '';

	const urlInfo = extractUrlInfo(url);
	if (!urlInfo) return '';

	// 优先尝试网站根目录的 favicon.ico（最常见的位置）
	// 大多数网站都会在根目录放置 favicon.ico
	return `${urlInfo.baseUrl}/favicon.ico`;
}

/**
 * 获取备用 favicon URL（当主要路径失败时使用）
 * 使用 DuckDuckGo 图标服务作为备用（开源且不依赖 Google）
 */
export function getFaviconUrlFallback(url: string): string {
	if (!url) return '';

	const urlInfo = extractUrlInfo(url);
	if (!urlInfo) return '';

	// 使用 DuckDuckGo 图标服务作为备用（开源且不依赖 Google）
	return `${ICON_CONFIG.FALLBACK_SERVICE}/${urlInfo.domain}.ico`;
}

/**
 * 获取所有可能的 favicon 路径（按优先级排序）
 * 用于客户端尝试多个路径
 */
export function getFaviconCandidates(url: string, customIcon?: string): string[] {
	const candidates: string[] = [];

	// 1. 如果提供了自定义图标，优先使用
	if (customIcon) {
		candidates.push(customIcon);
	}

	const urlInfo = extractUrlInfo(url);
	if (!urlInfo) return candidates;

	// 2. 尝试网站根目录的常见 favicon 路径（按常见程度排序）
	const commonPaths = [
		`${urlInfo.baseUrl}/favicon.ico`, // 最常见
		`${urlInfo.baseUrl}/favicon.png`,
		`${urlInfo.baseUrl}/favicon.svg`,
		`${urlInfo.baseUrl}/apple-touch-icon.png`,
		`${urlInfo.baseUrl}/icon.png`,
		`${urlInfo.baseUrl}/icon.svg`
	];

	candidates.push(...commonPaths);

	// 3. 最后使用备用图标服务
	const fallbackUrl = getFaviconUrlFallback(url);
	if (fallbackUrl && !candidates.includes(fallbackUrl)) {
		candidates.push(fallbackUrl);
	}

	return candidates;
}

/**
 * 获取图标 URL（优先使用提供的 icon，否则自动生成）
 * 
 * 注意：由于浏览器跨域限制，无法直接获取网站的 meta 标签
 * 这里优先使用网站根目录的 favicon.ico（标准位置）
 * 如果失败，组件会自动尝试其他路径
 */
export function getIconUrl(itemIcon: string | undefined, itemUrl: string): string {
	// 如果提供了图标，直接使用
	if (itemIcon) {
		return itemIcon;
	}

	// 否则从 URL 自动生成（优先使用网站自己的 favicon）
	return getFaviconUrl(itemUrl);
}
