import adapterAuto from "@sveltejs/adapter-auto";
import adapterStatic from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ".md", ".svx"],
  preprocess: [vitePreprocess(), mdsvex({ extensions: [".md", ".svx"] })],

  kit: {
    paths: {
      base: "",
    },
    adapter: (() => {
      const adapterPreference = process.env.SVELTEKIT_ADAPTER?.toLowerCase();
      const isCi = process.env.CI === "true";
      const useStatic =
        adapterPreference === "static" ||
        (!adapterPreference && !isCi);

      return useStatic ? adapterStatic({
        pages: "build",
        assets: "build",
        fallback: undefined,
        precompress: false,
        strict: true,
      }) : adapterAuto();
    })(),
    prerender: {
      handleHttpError: "warn",
      handleUnseenRoutes: "warn",
    },
    // SSR 优化配置
    // 对于静态站点，大部分页面都是预渲染的
    // 但对于 SSR 模式，可以优化响应时间
    csp: {
      mode: "auto",
    },
  },
};

export default config;
