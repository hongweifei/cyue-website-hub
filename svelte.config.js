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
    },
  },
};

export default config;
