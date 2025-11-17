import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	base: './',
	define: {
		// 在构建时注入构建时间作为全局常量
		// 这样构建时间会直接编译到最终的JavaScript代码中
		__BUILD_TIME__: JSON.stringify(new Date().toISOString())
	},
	plugins: [sveltekit()]
});
