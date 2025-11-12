export interface WebsiteConfig {
	domain?: string;
	name: string;
	description?: string;
	icon?: string;
	image?: string;
	keywords?: string;
	locale?: string;
	author?: string;
	version?: string;
}

export interface NavItem {
	id: string;
	name: string;
	url: string;
	icon?: string;
	info?: string;
	desc_md?: string;
	group: string;
	tags: string[];
}

export interface GroupMetadata {
	id: string;
	name: string;
	description?: string;
	icon?: string;
	order?: number;
	parentId?: string | null;
}

export interface NavGroup {
	id: string;
	name: string;
	description?: string;
	icon?: string;
	order?: number;
	items: NavItem[];
	parentId?: string | null;
	children?: NavGroup[];
}

export interface SearchFilters {
	query: string;
	group?: string;
	tags: string[];
}

