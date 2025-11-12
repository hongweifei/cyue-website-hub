import type { LayoutServerLoad } from "./$types";
import type { WebsiteConfig } from "$lib/types";
import { loadAllNavItems, loadGroups, getAllTags } from "$lib/dataLoader";

export const prerender = true;

export const load: LayoutServerLoad = () => {
  const groups = loadGroups();
  const tags = getAllTags();
  const navItems = loadAllNavItems();
  const config = (() => {
    const defaultWebsiteName = "鸽子导航网";
    const defaultDescription = `${defaultWebsiteName} - 精选网站导航，快速找到你需要的网站`;
    const defaultIcon = "/favicon.png";
    const defaultImage = "/favicon.png";
    const defaultKeywords =
      "导航,网站导航,网址导航,导航网站,网站收藏,书签,工具";
    const defaultLocale = "zh_CN";
    const defaultAuthor = "尘跃";
    const defaultVersion = "0.1";
    const module = import.meta.glob<WebsiteConfig>("/src/data/config.json", {
      eager: true,
    });
    let config = module["/src/data/config.json"];
    if (!config) {
      config = {
        name: defaultWebsiteName,
      };
    }
    return {
      name: config.name || defaultWebsiteName,
      description: config.description || defaultDescription,
      icon: config.icon || defaultIcon,
      image: config.image || defaultImage,
      keywords: config.keywords || defaultKeywords,
      locale: config.locale || defaultLocale,
      author: config.author || defaultAuthor,
      version: config.version || defaultVersion,
    };
  })();

  return {
    navigation: {
      groups,
      tags,
      navItems,
    },
    site: config,
  };
};
