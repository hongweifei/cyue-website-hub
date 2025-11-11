export const prerender = true;

import { error } from '@sveltejs/kit';
import { loadGroups } from '$lib/dataLoader';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const groups = loadGroups();
	const group = groups.find((g) => g.id === params.group || g.name === params.group);

	if (!group) {
		throw error(404, '分组不存在');
	}

	return {
		group
	};
};

export async function entries() {
	const groups = loadGroups();
	return groups.map((group) => ({
		group: group.id
	}));
}
