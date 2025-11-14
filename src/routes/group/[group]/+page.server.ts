export const prerender = true;

import { error } from '@sveltejs/kit';
import { loadGroups, encodeGroupIdForUrl, decodeGroupIdFromUrl } from '$lib/dataLoader';
import { findGroupInTree } from '$lib/utils/group';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const groups = loadGroups();
	const decodedGroupId = decodeGroupIdFromUrl(params.group);
	const group = findGroupInTree(groups, (g) => g.id === decodedGroupId);

	if (!group) {
		throw error(404, '分组不存在');
	}

	return {
		group
	};
};

export async function entries() {
	const groups = loadGroups();
	const { flattenGroupTree } = await import('$lib/utils/group');
	const allGroups = flattenGroupTree(groups);
	return allGroups.map((group) => ({
		group: encodeGroupIdForUrl(group.id) // 编码分组ID用于URL
	}));
}
