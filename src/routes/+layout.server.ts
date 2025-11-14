import type { LayoutServerLoad } from "./$types";
import type { WebsiteConfig } from "$lib/types";
import {
  loadAllNavItems,
  loadGroups,
  getAllTags,
  getTagSummaries,
} from "$lib/dataLoader";

export const prerender = true;

export const load: LayoutServerLoad = ({ url }) => {
  // 按需加载 navigation 数据，只在需要导航功能的页面加载
  // 这样可以减少不必要的内存占用和加载时间
  const shouldLoadNavigation =
    url.pathname === "/" || url.pathname.startsWith("/favorites");

  const navigation = shouldLoadNavigation
    ? {
        groups: loadGroups(),
        tags: getAllTags(),
        tagSummaries: getTagSummaries(),
        navItems: loadAllNavItems(),
      }
    : null;

  const config = (() => {
    const defaultDomain = "hub.cyue.net";
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
        domain: defaultDomain,
        name: defaultWebsiteName,
      };
    }
    return {
      domain: config.domain || defaultDomain,
      name: config.name || defaultWebsiteName,
      description: config.description || defaultDescription,
      icon: config.icon || defaultIcon,
      image: config.image || defaultImage,
      keywords: config.keywords || defaultKeywords,
      locale: config.locale || defaultLocale,
      author: config.author || defaultAuthor,
      contactEmail: config.contactEmail,
      version: config.version || defaultVersion,
    };
  })();

  return {
    navigation,
    site: config,
  };
};
