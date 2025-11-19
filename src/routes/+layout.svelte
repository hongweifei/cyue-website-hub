<script lang="ts">
  import { onMount } from "svelte";
  import { favorites } from "$lib/stores/favorites";
  import { theme } from "$lib/stores/theme";
  import { useNavigation } from "$lib/hooks/useNavigation";
  import { goto } from "$app/navigation";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import LayoutToggle from "$lib/components/LayoutToggle.svelte";
  import { layout, type LayoutMode } from "$lib/stores/layout";
  import "../app.css";
  import type { LayoutData } from "./$types";

  const { children, data } = $props<{ data: LayoutData }>();

  // 在 layout 级别初始化 navigation context
  // 如果当前页面有 navigation 数据则使用，否则创建空状态
  const navigation = useNavigation(data.navigation);

  // 监听数据变化和路由变化
  if (browser) {
    // 当 navigation 数据从 null 变为有值时，更新 store
    $effect(() => {
      if (data.navigation) {
        navigation.groups.set(data.navigation.groups);
        navigation.allTags.set(data.navigation.tags);
        navigation.tagSummaries.set(data.navigation.tagSummaries);
        navigation.navItems.set(data.navigation.navItems);
      }
    });

    // 监听路由变化，当导航到需要数据的页面时，如果数据不存在则重新加载
    $effect(() => {
      const currentPath = page.url.pathname;
      const needsNavigation = currentPath === "/" || currentPath.startsWith("/favorites");
      
      if (needsNavigation && !data.navigation) {
        // 如果导航到需要数据的页面但数据不存在，重新加载
        invalidateAll();
      }
    });
  }

  let currentLayout: LayoutMode = $state("sidebar");

  $effect(() => {
    const unsubscribe = layout.subscribe((mode) => {
      currentLayout = mode;
    });
    return unsubscribe;
  });

  function handleLayoutToggle() {
    layout.toggle();
  }

  function handleNavClick(event: MouseEvent, href: string) {
    // 如果当前已经在目标页面，不需要导航
    if (page.url.pathname === href) {
      event.preventDefault();
      return;
    }
    // 使用 goto 确保页面正确更新
    event.preventDefault();
    goto(href, { invalidateAll: true });
  }

  onMount(async () => {
    favorites.init();
    // 初始化布局
    layout.init();
    // 初始化主题（异步加载CSS）
    await theme.init();
  });
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Standard SEO Meta Tags -->
  <meta name="title" content={data.site?.name} />
  <meta name="description" content={data.site?.description} />
  <meta name="keywords" content={data.site?.keywords} />
  <meta name="author" content={data.site?.author} />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#0a59f7" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta
    property="og:url"
    content="http://{data.site?.domain}{page.url.pathname}"
  />
  <meta property="og:title" content={data.site?.name} />
  <meta property="og:description" content={data.site?.description} />
  <meta
    property="og:image"
    content="http://{data.site?.domain}{data.site?.image}"
  />
  <meta property="og:site_name" content={data.site?.name} />
  <meta property="og:locale" content="zh_CN" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.site?.name} />
  <meta name="twitter:description" content={data.site?.description} />
  <meta
    name="twitter:image"
    content="http://{data.site?.domain}{data.site?.image}"
  />
  <meta name="twitter:site" content="@{data.site?.domain}" />

  <!-- Additional SEO tags -->
  <link rel="canonical" href="http://{data.site?.domain}" />
  <link
    rel="alternate"
    type="application/rss+xml"
    title="{data.site?.name} RSS Feed"
    href="http://{data.site?.domain}/rss.xml"
  />

  <title>{data.site?.name}</title>
</svelte:head>

<div class="app">
  <header class="header">
    <div class="container">
      <div class="header-shell">
        <h1 class="logo">
          <a
            href="/"
            data-sveltekit-preload-data="hover"
            onclick={(e) => handleNavClick(e, "/")}>🕊️ {data.site?.name}</a
          >
        </h1>
        <nav class="nav">
          <div class="nav-links">
            <a
              href="/"
              class="nav-link"
              data-sveltekit-preload-data="hover"
              onclick={(e) => handleNavClick(e, "/")}>首页</a
            >
            <a
              href="/favorites"
              class="nav-link"
              data-sveltekit-preload-data="hover"
              onclick={(e) => handleNavClick(e, "/favorites")}>收藏</a
            >
          </div>
          <div class="nav-controls">
            <LayoutToggle currentMode={currentLayout} onToggle={handleLayoutToggle} />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </div>
  </header>

  <main class="main">
    <div class="container">
      {@render children()}
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-shell">
        <div class="footer-brand">
          <a class="footer-logo" href="/" data-sveltekit-preload-data="hover" onclick={(e) => handleNavClick(e, "/")}>
            <span class="logo-mark">🕊️</span>
            <div class="logo-text">
              <strong>{data?.site?.name}</strong>
              <small>{data?.site?.description}</small>
            </div>
          </a>
          <div class="footer-badges">
            {#if data?.site?.version}
              <span class="badge">版本 {data.site.version}</span>
            {/if}
            {#if data?.buildTime}
              <span class="badge">
                构建于 {
                  new Intl.DateTimeFormat(
                    'zh-CN',
                    {
                      year: 'numeric',       // 四位数年份（如：2025）
                      month: 'numeric',      // 数字月份（如：3，不带前导零）
                      day: 'numeric',        // 数字日期（如：5，不带前导零）
                      hour: '2-digit',       // 24小时制的两位数小时（如：08，15）
                      minute: '2-digit',     // 两位数分钟（如：05，30）
                      second: '2-digit',     // 两位数秒（如：09，59）
                      hour12: false          // 禁用12小时制，使用24小时制
                    }
                  ).format(new Date(data.buildTime))
                }
              </span>
            {/if}
          </div>
        </div>

        <div class="footer-links">
          <h3>快速访问</h3>
          <ul>
            <li><a href="/" data-sveltekit-preload-data="hover" onclick={(e) => handleNavClick(e, "/")}>首页</a></li>
            <li>
              <a
                href="/favorites"
                data-sveltekit-preload-data="hover"
                onclick={(e) => handleNavClick(e, "/favorites")}>收藏夹</a
              >
            </li>
          </ul>
        </div>

        <div class="footer-contact">
          <h3>联系我们</h3>
          <ul>
            {#if data?.site?.contactEmail}
              <li>
                <a href={`mailto:${data.site.contactEmail}`}>{data.site.contactEmail}</a>
              </li>
            {/if}
            <li>
              <a href="https://gitee.com/hongweifei/cyue-website-hub" rel="noopener" target="_blank"
                >项目仓库</a
              >
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-meta">
        <span>
          &copy; {new Date().getFullYear()} {data?.site?.name}. 让发现更简单。
        </span>
        <span class="footer-theme-hint">多风格主题 · 色彩 × 质感 × 排版</span>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(:root) {
    --layout-density-scale: 1;
    --layout-app-padding-y: var(--spacing-xl);
    --layout-app-padding-x: var(--spacing-lg);
    --layout-shell-gap: var(--spacing-xl);
    --layout-container-max-width: 1200px;
    --layout-header-padding-y: calc(var(--spacing-sm) * 1.5);
    --layout-header-padding-x: var(--spacing-lg);
    --layout-header-direction: row;
    --layout-header-align: center;
    --layout-header-justify: space-between;
    --layout-header-gap: var(--spacing-lg);
    --layout-header-background: var(--component-card-glass-bg, var(--surface-glass));
    --layout-header-border: var(--component-card-glass-border, 1px solid var(--border-light));
    --layout-header-shadow: var(--component-card-glass-shadow, var(--shadow-sm));
    --layout-header-backdrop: var(--component-card-glass-backdrop, blur(20px));
    --layout-main-padding-y: var(--spacing-xl);
    --layout-main-padding-x: var(--spacing-xl);
    --layout-main-gap: var(--spacing-xl);
    --layout-main-border: var(--component-card-default-border, 1px solid var(--border-light));
    --layout-main-shadow: var(--component-card-default-shadow, var(--shadow-sm));
    --layout-main-background: var(--component-card-default-bg, var(--card-bg));
    --layout-footer-padding: var(--component-card-glass-padding, clamp(var(--spacing-xl), 5vw, var(--spacing-2xl)));
    --layout-nav-gap: var(--spacing-lg);
    --layout-nav-justify: flex-start;
    --layout-nav-align: center;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: calc(var(--layout-shell-gap) * var(--layout-density-scale));
    padding:
      calc(var(--layout-app-padding-y) * var(--layout-density-scale))
      calc(var(--layout-app-padding-x) * var(--layout-density-scale));
    background: var(--app-background);
  }

  .container {
    width: 100%;
    max-width: var(--layout-container-max-width);
    margin: 0 auto;
  }

  .header {
    position: sticky;
    top: calc(var(--spacing-sm) * 0.75);
    z-index: 100;
    padding: 0;
  }

  .header-shell {
    display: flex;
    justify-content: var(--layout-header-justify);
    align-items: var(--layout-header-align);
    flex-direction: var(--layout-header-direction);
    gap: var(--layout-header-gap);
    padding:
      calc(var(--layout-header-padding-y) * var(--layout-density-scale))
      calc(var(--layout-header-padding-x) * var(--layout-density-scale));
    background: var(--layout-header-background);
    border-radius: var(--component-card-glass-radius, var(--radius-2xl));
    border: var(--layout-header-border);
    box-shadow: var(--layout-header-shadow);
    backdrop-filter: var(--layout-header-backdrop);
    -webkit-backdrop-filter: var(--layout-header-backdrop);
    /* 优化 transition - 只过渡会变化的属性，保留视觉效果 */
    transition: var(--component-card-glass-transition, all var(--transition-base) cubic-bezier(0.4, 0, 0.2, 1));
    /* GPU 加速 backdrop-filter */
    transform: translateZ(0);
    will-change: transform, box-shadow;
    /* 限制重排范围，但不限制 paint 以避免层叠上下文问题 */
    contain: layout style;
  }

  .header-shell:hover {
    transform: var(--component-card-glass-transform-hover, translateY(-2px)) translateZ(0);
    box-shadow: var(--component-card-glass-shadow-hover, var(--shadow-sm));
    border-color: var(--component-card-glass-border-hover, var(--border-accent));
  }

  .logo {
    margin: 0;
    font-size: 1.625rem;
    font-weight: 720;
    letter-spacing: 0.04em;
  }

  .logo a {
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    /* 将渐变背景应用到链接上，确保文字可见 */
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 65%, var(--primary-color-strong) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent; /* 后备方案，确保文字透明以显示渐变 */
    /* 优化渐变文字渲染性能 */
    transform: translateZ(0);
    will-change: background;
    contain: layout style;
  }

  .nav {
    display: flex;
    align-items: var(--layout-nav-align);
    justify-content: var(--layout-nav-justify);
    gap: var(--layout-nav-gap);
    flex-wrap: var(--layout-nav-wrap, wrap);
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .nav-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .nav-link {
    position: relative;
    color: var(--component-link-secondary-color, var(--text-secondary));
    font-weight: 500;
    font-size: 0.9375rem;
    padding: calc(var(--spacing-xs) * 1.25) var(--spacing-md);
    border-radius: var(--radius-full);
    letter-spacing: 0.01em;
    text-decoration: var(--component-link-secondary-text-decoration, none);
    /* 优化 transition - 使用组件样式变量 */
    transition: var(--component-link-secondary-transition, color var(--transition-fast), transform var(--transition-fast), background-size var(--transition-base));
    /* 优化渲染 */
    contain: layout style;
  }

  .nav-link::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: calc(var(--spacing-2xs) * -1);
    transform: translateX(-50%) scaleX(0) translateZ(0);
    width: 60%;
    height: var(--component-link-secondary-text-decoration-thickness, 1px);
    border-radius: var(--radius-full);
    background: linear-gradient(transparent, transparent), var(--component-link-secondary-underline, linear-gradient(var(--text-secondary), var(--text-secondary)));
    background-size: 0% 100%, 0% 100%;
    background-position: left, left;
    background-repeat: no-repeat;
    opacity: 0;
    /* 优化 transition - 只过渡 transform 和 opacity（GPU 加速） */
    transition: transform var(--transition-fast), opacity var(--transition-fast), background-size var(--transition-base);
    will-change: transform, opacity, background-size;
  }

  .nav-link:hover {
    color: var(--component-link-secondary-color-hover, var(--text-primary));
    transform: var(--component-link-secondary-transform-hover, translateY(-1px));
  }

  .nav-link:hover::after,
  .nav-link:focus-visible::after {
    opacity: 1;
    transform: translateX(-50%) scaleX(1);
    background: var(--component-link-secondary-underline-hover, linear-gradient(var(--text-primary), var(--text-primary)));
    background-size: 100% 100%, 100% 100%;
  }

  .nav-link:focus-visible {
    outline: none;
    color: var(--component-link-secondary-color-hover, var(--text-primary));
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .main .container {
    background: var(--layout-main-background);
    border-radius: var(--component-card-default-radius, var(--radius-2xl));
    padding:
      calc(var(--layout-main-padding-y) * var(--layout-density-scale))
      calc(var(--layout-main-padding-x) * var(--layout-density-scale));
    border: var(--layout-main-border);
    box-shadow: var(--layout-main-shadow);
    backdrop-filter: var(--component-card-default-backdrop, blur(16px));
    -webkit-backdrop-filter: var(--component-card-default-backdrop, blur(16px));
    /* 优化 transition - 使用组件样式变量 */
    transition: var(--component-card-default-transition, all var(--transition-base) cubic-bezier(0.4, 0, 0.2, 1));
    /* GPU 加速 backdrop-filter */
    transform: translateZ(0);
    will-change: transform, box-shadow;
    /* 限制重排范围 */
    contain: layout style paint;
  }

  .main .container:hover {
    transform: var(--component-card-default-transform-hover, translateY(-3px)) translateZ(0);
    box-shadow: var(--component-card-default-shadow-hover, var(--shadow-sm));
    border-color: var(--component-card-default-border-hover, var(--border-accent));
  }

  .footer {
    margin-top: auto;
    position: relative;
    isolation: isolate;
  }

  .footer::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--radius-xl);
    background: var(--gradient-brand-soft);
    opacity: 0.55;
    filter: blur(48px);
    z-index: -2;
  }

  .footer .container {
    position: relative;
  }

  .footer-shell {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: clamp(var(--spacing-lg), 4vw, var(--spacing-2xl));
    padding: var(--layout-footer-padding);
    border-radius: var(--component-card-glass-radius, var(--radius-2xl));
    background: var(--component-card-glass-bg, linear-gradient(
        140deg,
        color-mix(in srgb, var(--surface-glass) 90%, transparent),
        color-mix(in srgb, var(--card-bg) 95%, transparent)
      ));
    border: var(--component-card-glass-border, 1px solid var(--border-light));
    box-shadow: var(--component-card-glass-shadow, var(--shadow-sm));
    backdrop-filter: var(--component-card-glass-backdrop, blur(24px));
    -webkit-backdrop-filter: var(--component-card-glass-backdrop, blur(24px));
    color: var(--text-secondary);
    /* GPU 加速 backdrop-filter */
    transform: translateZ(0);
    /* 限制重排范围 */
    contain: layout style paint;
  }

  .footer-shell:hover {
    transform: var(--component-card-glass-transform-hover, translateY(-2px)) translateZ(0);
    box-shadow: var(--component-card-glass-shadow-hover, var(--shadow-sm));
    border-color: var(--component-card-glass-border-hover, var(--border-accent));
  }

  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .footer-logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    text-decoration: none;
    color: inherit;
  }

  .footer-logo .logo-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 14px;
    background: var(--gradient-brand);
    color: var(--text-inverse);
    font-size: 1.35rem;
    box-shadow: var(--shadow-sm);
  }

  .footer-logo .logo-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .footer-logo strong {
    font-size: 1rem;
    color: var(--text-primary);
    letter-spacing: 0.02em;
  }

  .footer-logo small {
    color: var(--text-tertiary);
    font-size: 0.75rem;
  }

  .footer-badges {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .badge {
    padding: var(--component-badge-default-padding, calc(var(--spacing-xs) * 0.75) var(--spacing-sm));
    border-radius: var(--component-badge-default-radius, var(--radius-full));
    font-size: 0.75rem;
    background: var(--component-badge-default-bg, var(--bg-tertiary));
    color: var(--component-badge-default-color, var(--text-secondary));
    border: var(--component-badge-default-border, var(--border-light));
    box-shadow: var(--component-badge-default-shadow, inset 0 1px 2px rgba(0, 0, 0, 0.05));
    backdrop-filter: blur(8px);
    font-weight: 500;
  }

  .footer-links,
  .footer-contact {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .footer-links h3,
  .footer-contact h3 {
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 650;
    letter-spacing: 0.03em;
  }

  .footer-links ul,
  .footer-contact ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .footer-links a,
  .footer-contact a {
    position: relative;
    color: var(--component-link-secondary-color, var(--text-secondary));
    font-weight: 500;
    text-decoration: var(--component-link-secondary-text-decoration, none);
    padding: 0.25rem 0;
    /* 优化 transition - 使用组件样式变量 */
    transition: var(--component-link-secondary-transition, color var(--transition-fast), transform var(--transition-fast), background-size var(--transition-base));
    /* 优化渲染 */
    contain: layout style;
    will-change: transform;
  }

  .footer-links a::after,
  .footer-contact a::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: calc(var(--component-link-secondary-text-underline-offset, 2px) * -1);
    width: 100%;
    height: var(--component-link-secondary-text-decoration-thickness, 1px);
    border-radius: 999px;
    background: var(--component-link-secondary-underline, linear-gradient(transparent, transparent), linear-gradient(var(--text-secondary), var(--text-secondary)));
    background-size: 0% 100%, 0% 100%;
    background-position: left, left;
    background-repeat: no-repeat;
    opacity: 0;
    transform: scaleX(0.5) translateZ(0);
    /* 优化 transition - 只过渡 transform 和 opacity（GPU 加速） */
    transition: opacity var(--transition-fast), transform var(--transition-fast), background-size var(--transition-base);
    will-change: transform, opacity, background-size;
  }

  .footer-links a:hover,
  .footer-links a:focus-visible,
  .footer-contact a:hover,
  .footer-contact a:focus-visible {
    color: var(--component-link-secondary-color-hover, var(--text-primary));
    transform: var(--component-link-secondary-transform-hover, translateY(-1px)) translateZ(0);
  }

  .footer-links a:hover::after,
  .footer-links a:focus-visible::after,
  .footer-contact a:hover::after,
  .footer-contact a:focus-visible::after {
    opacity: 1;
    transform: scaleX(1);
    background: var(--component-link-secondary-underline-hover, linear-gradient(transparent, transparent), linear-gradient(var(--text-primary), var(--text-primary)));
    background-size: 100% 100%, 100% 100%;
  }

  .footer-meta {
    margin-top: clamp(var(--spacing-md), 3vw, var(--spacing-xl));
    padding: var(--spacing-md) clamp(var(--spacing-sm), 3vw, var(--spacing-lg));
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    justify-content: space-between;
    align-items: center;
    color: var(--text-tertiary);
    font-size: 0.8rem;
  }

  .footer-theme-hint {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .footer-theme-hint::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
  }

  :global(:root[data-layout-shell="fluid"]) {
    --layout-container-max-width: 1360px;
    --layout-app-padding-y: clamp(var(--spacing-lg), 4vw, var(--spacing-2xl));
    --layout-app-padding-x: clamp(var(--spacing-lg), 4vw, var(--spacing-2xl));
    --layout-shell-gap: clamp(var(--spacing-lg), 4vw, var(--spacing-2xl));
  }

  :global(:root[data-layout-shell="immersive"]) {
    --layout-container-max-width: 1480px;
    --layout-app-padding-y: clamp(var(--spacing-xl), 5vw, var(--spacing-2xl));
    --layout-app-padding-x: clamp(var(--spacing-xl), 5vw, var(--spacing-2xl));
    --layout-shell-gap: calc(var(--spacing-2xl) * 1.2);
  }

  :global(:root[data-layout-shell="immersive"]) .main .container {
    max-width: 100%;
  }

  :global(:root[data-layout-shell="edge-to-edge"]) {
    --layout-container-max-width: 100%;
    --layout-app-padding-y: clamp(var(--spacing-md), 3vw, var(--spacing-xl));
    --layout-app-padding-x: clamp(var(--spacing-md), 3vw, var(--spacing-xl));
    --layout-shell-gap: var(--spacing-lg);
  }

  :global(:root[data-layout-shell="edge-to-edge"]) .container {
    max-width: 100%;
    padding-left: clamp(var(--spacing-md), 3vw, var(--spacing-xl));
    padding-right: clamp(var(--spacing-md), 3vw, var(--spacing-xl));
  }

  :global(:root[data-layout-density="cozy"]) {
    --layout-density-scale: 0.9;
  }

  :global(:root[data-layout-density="compact"]) {
    --layout-density-scale: 0.82;
  }

  :global(:root[data-layout-header="stacked"]) {
    --layout-header-direction: column;
    --layout-header-align: flex-start;
    --layout-header-justify: flex-start;
    --layout-header-gap: var(--spacing-md);
  }

  :global(:root[data-layout-header="inline"]) {
    --layout-header-padding-y: calc(var(--spacing-sm) * 1.1);
    --layout-header-padding-x: var(--spacing-md);
    --layout-header-background: var(--bg-primary);
    --layout-header-border: 1px solid var(--border-light);
    --layout-header-shadow: var(--shadow-xs);
    --layout-header-backdrop: none;
    --layout-header-gap: var(--spacing-md);
  }

  :global(:root[data-layout-header="condensed"]) {
    --layout-header-padding-y: var(--spacing-sm);
    --layout-header-padding-x: calc(var(--spacing-sm) * 1.25);
    --layout-header-gap: var(--spacing-md);
  }

  :global(:root[data-layout-navigation="segmented"]) {
    --layout-nav-wrap: wrap;
    --layout-nav-gap: var(--spacing-sm);
  }

  :global(:root[data-layout-navigation="segmented"]) .header .nav-links {
    padding: var(--spacing-2xs);
    border-radius: var(--radius-full);
    border: 1px solid var(--border-light);
    background: var(--bg-secondary);
    gap: var(--spacing-2xs);
  }

  :global(:root[data-layout-navigation="segmented"]) .header .nav-link {
    border-radius: var(--radius-full);
    padding: calc(var(--spacing-xs) * 1.15) var(--spacing-lg);
    background: transparent;
    border: none;
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }

  :global(:root[data-layout-navigation="segmented"]) .header .nav-link:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  :global(:root[data-layout-navigation="segmented"]) .header .nav-link::after {
    display: none;
  }

  :global(:root[data-layout-navigation="tabs"]) {
    --layout-nav-wrap: wrap;
    --layout-nav-gap: var(--spacing-sm);
  }

  :global(:root[data-layout-navigation="tabs"]) .header .nav-links {
    width: 100%;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: var(--spacing-2xs);
  }

  :global(:root[data-layout-navigation="tabs"]) .header .nav-link {
    border-radius: 0;
    padding: calc(var(--spacing-xs) * 1.1) var(--spacing-md);
    margin-bottom: -2px;
    border-bottom: 2px solid transparent;
    transition: border-color var(--transition-fast), color var(--transition-fast);
  }

  :global(:root[data-layout-navigation="tabs"]) .header .nav-link:hover {
    border-bottom-color: var(--border-accent);
    color: var(--text-primary);
  }

  :global(:root[data-layout-navigation="tabs"]) .header .nav-link::after {
    width: 100%;
    left: 0;
    transform: scaleX(0);
    bottom: -2px;
    height: 2px;
    background: var(--primary-color);
  }

  :global(:root[data-layout-navigation="tabs"]) .header .nav-link:hover::after {
    transform: scaleX(1);
  }

  :global(:root[data-layout-navigation="minimal"]) {
    --layout-nav-gap: var(--spacing-sm);
    --layout-nav-wrap: nowrap;
  }

  :global(:root[data-layout-navigation="minimal"]) .header .nav-link {
    padding: 0;
    border: none;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
  }

  :global(:root[data-layout-navigation="minimal"]) .header .nav-link::after {
    display: none;
  }

  :global(:root[data-layout-sidebar="floating"] .sidebar) {
    position: static;
    max-height: none;
    top: auto;
    box-shadow: var(--shadow-md);
  }

  :global(:root[data-layout-sidebar="condensed"] .sidebar) {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  :global(:root[data-layout-cards="floating"]) {
    --layout-main-background: var(--component-card-glass-bg, var(--surface-glass));
    --layout-main-shadow: var(--shadow-lg);
    --layout-main-border: 1px solid rgba(255, 255, 255, 0.12);
  }

  :global(:root[data-layout-cards="floating"]) .main .container {
    backdrop-filter: var(--component-card-glass-backdrop, blur(24px));
    -webkit-backdrop-filter: var(--component-card-glass-backdrop, blur(24px));
  }

  :global(:root[data-layout-cards="flat"]) {
    --layout-main-background: var(--bg-primary);
    --layout-main-shadow: none;
    --layout-main-border: 1px solid var(--border-light);
  }

  :global(:root[data-layout-cards="flat"]) .main .container {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  @media (max-width: 1024px) {
    .app {
      padding: var(--spacing-lg) var(--spacing-md);
      gap: var(--spacing-lg);
    }

    .main .container {
      padding: var(--spacing-lg);
    }
  }

  @media (max-width: 768px) {
    .app {
      padding: var(--spacing-md) var(--spacing-sm);
      gap: var(--spacing-md);
    }
    .main .container:hover {
      box-shadow: none;
    }

    .header {
      position: static;
    }

    .header-shell {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: transparent;
      border: none;
      box-shadow: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border-radius: 0;
    }

    .logo {
      font-size: 1.4rem;
    }

    .nav {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-md);
    }

    .nav-links {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--spacing-sm);
      width: 100%;
    }

    .nav-controls {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      width: 100%;
      justify-content: space-between;
    }

    .nav-link {
      flex: none;
      font-size: 0.875rem;
      padding: var(--spacing-sm) var(--spacing-md);
      margin: 0;
      text-align: center;
      border: 1px solid var(--border-light);
      background: var(--bg-secondary);
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: transparent;
    }

    .nav-link::after {
      display: none;
    }

    .nav-link:hover,
    .nav-link:focus-visible,
    .nav-link:active {
      transform: none;
      box-shadow: none;
      background: var(--bg-tertiary);
    }

    .main .container {
      padding: var(--spacing-md);
      background: transparent;
      border: none;
      box-shadow: none;
    }

    .footer::before {
      inset: var(--spacing-sm);
      filter: blur(36px);
    }

    .footer-shell {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      background: none;
      border: none;
      box-shadow: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      color: var(--text-secondary);
    }

    .footer-logo .logo-mark {
      width: 36px;
      height: 36px;
    }

    .footer-badges {
      gap: var(--spacing-2xs);
    }

    .footer-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-xs);
      padding: 0 var(--spacing-sm) var(--spacing-lg);
    }
  }

  @media (max-width: 480px) {
    .app {
      padding: var(--spacing-sm);
      gap: var(--spacing-sm);
    }

    .logo {
      font-size: 1.25rem;
    }

    .nav-links {
      grid-template-columns: 1fr;
      gap: var(--spacing-xs);
    }

    .nav-link {
      font-size: 0.8125rem;
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    .main .container {
      padding: var(--spacing-sm);
    }

    .footer-shell {
      padding: var(--spacing-md) var(--spacing-sm);
    }
  }
</style>
