export const prerender = true;

import { error } from '@sveltejs/kit';
import { loadAllNavItems, loadMarkdownContent } from '$lib/dataLoader';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const allItems = loadAllNavItems();
	const item = allItems.find((i) => i.id === params.id);

	if (!item) {
		throw error(404, '导航项不存在');
	}

	const markdownContent = loadMarkdownContent(item);

	return {
		item,
		markdownContent
	};
};

export async function entries() {
	const allItems = loadAllNavItems();
	return allItems.map((item) => ({
		id: item.id
	}));
}
