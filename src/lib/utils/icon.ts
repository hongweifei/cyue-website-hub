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

	// 优先尝试网站根目录的 favicon.ico（最常见位置）
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
	const visited = new Set<string>();

	const pushCandidate = (value: string | null | undefined) => {
		if (!value) return;
		if (visited.has(value)) return;
		visited.add(value);
		candidates.push(value);
	};

	const urlInfo = extractUrlInfo(url);
	if (!urlInfo) return candidates;

	// 1. 如果提供了自定义图标，优先处理相对路径
	if (customIcon) {
		// 检查是否为相对路径（以 / 开头但不是以 // 或 http/https 开头）
		if (customIcon.startsWith('/') && !customIcon.startsWith('//') && !customIcon.startsWith('http')) {
			// 优先从对应网站获取相对路径图标
			pushCandidate(`${urlInfo.baseUrl}${customIcon}`);
			// 其次从本地获取
			pushCandidate(customIcon);
		} else {
			// 如果不是相对路径，直接添加原路径
			pushCandidate(customIcon);
		}
	}

	// 2. 网站根目录的常见 favicon 路径：优先 ico，再尝试 png/svg
	pushCandidate(`${urlInfo.baseUrl}/favicon.ico`);
	pushCandidate(`${urlInfo.baseUrl}/favicon.png`);
	pushCandidate(`${urlInfo.baseUrl}/favicon.svg`);

	// 3. 最后使用备用图标服务
	pushCandidate(getFaviconUrlFallback(url));

	return candidates.slice(0, ICON_CONFIG.MAX_ICON_CANDIDATES);
}

/**
 * 获取图标 URL（优先使用提供的 icon，否则自动生成）
 *
 * 注意：由于浏览器跨域限制，无法直接获取网站的 meta 标签
 * 这里优先使用网站根目录的 favicon.ico（标准位置）
 * 如果失败，组件会自动尝试其他路径
 */
export function getIconUrl(itemIcon: string | undefined, itemUrl: string): string {
	// 如果提供了图标，优先检查是否为相对路径
	if (itemIcon) {
		// 检查是否为相对路径（以 / 开头但不是以 // 或 http/https 开头）
		if (itemIcon.startsWith('/') && !itemIcon.startsWith('//') && !itemIcon.startsWith('http')) {
			// 优先从对应网站获取相对路径图标
			const urlInfo = extractUrlInfo(itemUrl);
			if (urlInfo) {
				return `${urlInfo.baseUrl}${itemIcon}`;
			}
		}
		// 如果不是相对路径或无法提取URL信息，直接返回原图标路径
		return itemIcon;
	}

	// 否则从 URL 自动生成（优先使用网站自己的 favicon）
	return getFaviconUrl(itemUrl);
}