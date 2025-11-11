import type { NavGroup } from '../types';

export function countGroupItems(group: NavGroup): number {
	const direct = group.items?.length ?? 0;
	const children = group.children ?? [];
	return direct + children.reduce((sum, child) => sum + countGroupItems(child), 0);
}

export function flattenGroupTree(groups: NavGroup[]): NavGroup[] {
	const result: NavGroup[] = [];
	const stack = [...groups];

	while (stack.length > 0) {
		const current = stack.pop()!;
		result.push(current);
		if (current.children && current.children.length > 0) {
			stack.push(...current.children);
		}
	}

	return result;
}

export function findGroupInTree(groups: NavGroup[], predicate: (group: NavGroup) => boolean): NavGroup | null {
	for (const group of groups) {
		if (predicate(group)) {
			return group;
		}
		if (group.children && group.children.length > 0) {
			const found = findGroupInTree(group.children, predicate);
			if (found) {
				return found;
			}
		}
	}
	return null;
}

