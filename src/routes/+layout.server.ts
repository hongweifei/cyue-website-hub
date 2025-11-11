import type { LayoutServerLoad } from './$types';
import { loadAllNavItems, loadGroups, getAllTags } from '$lib/dataLoader';

export const prerender = true;

export const load: LayoutServerLoad = () => {
	const groups = loadGroups();
	const tags = getAllTags();
	const navItems = loadAllNavItems();

	return {
		navigation: {
			groups,
			tags,
			navItems
		}
	};
};

