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
	try {
		const groups = loadGroups();
		if (!groups || groups.length === 0) {
			console.warn("[entries] loadGroups() 返回空数组，请检查数据文件是否存在");
			return [];
		}
		const { flattenGroupTree } = await import('$lib/utils/group');
		const allGroups = flattenGroupTree(groups);
		if (!allGroups || allGroups.length === 0) {
			console.warn("[entries] flattenGroupTree() 返回空数组");
			return [];
		}
		const entries = allGroups.map((group) => ({
			group: encodeGroupIdForUrl(group.id) // 编码分组ID用于URL
		}));
		console.log(`[entries] 为 /group/[group] 生成了 ${entries.length} 个条目`);
		return entries;
	} catch (error) {
		console.error("[entries] 加载分组时出错:", error);
		return [];
	}
}
