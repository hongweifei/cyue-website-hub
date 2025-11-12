import type { LayoutServerLoad } from './$types';
import type { WebsiteConfig } from '$lib/types';
import { loadAllNavItems, loadGroups, getAllTags } from '$lib/dataLoader';

export const prerender = true;

export const load: LayoutServerLoad = () => {
	const groups = loadGroups();
	const tags = getAllTags();
	const navItems = loadAllNavItems();
	const config = (()=>{
		const defaultWebsiteName = "鸽子导航网";
		const module = import.meta.glob<WebsiteConfig>(
			"/src/data/config.json",
			{
				eager: true,
			},
		);
		const config = module["/src/data/config.json"];
		if (!config) {
			return {
				name: defaultWebsiteName,
			};
		}
		if (!config.name) {
			config.name = defaultWebsiteName;
		}
		return config;
	})();

	return {
		navigation: {
			groups,
			tags,
			navItems
		},
		site: config,
	};
};

