import { error } from '@sveltejs/kit';
import { loadAllNavItems, loadMarkdownContent } from '$lib/dataLoader';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = ({ params }) => {
	const allItems = loadAllNavItems();
	const item = allItems.find((i) => i.id === params.id);

	if (!item) {
		throw error(404, '导航项不存在');
	}

	// 加载 Markdown 内容
	const markdownContent = loadMarkdownContent(item);

	return {
		item,
		markdownContent
	};
};

// 生成所有导航项的入口点
export async function entries() {
	const allItems = loadAllNavItems();
	return allItems.map((item) => ({
		id: item.id
	}));
}

