import { error } from '@sveltejs/kit';
import { loadGroups } from '$lib/dataLoader';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = ({ params }) => {
	const groups = loadGroups();
	// 支持通过 id 或 name 查找
	const group = groups.find((g) => g.id === params.group || g.name === params.group);

	if (!group) {
		throw error(404, '分组不存在');
	}

	return {
		group
	};
};

// 生成所有分组的入口点（使用 id）
export async function entries() {
	const groups = loadGroups();
	return groups.map((group) => ({
		group: group.id
	}));
}

