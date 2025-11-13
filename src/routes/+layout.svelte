<script lang="ts">
  import { onMount } from "svelte";
  import { favorites } from "$lib/stores/favorites";
  import { theme } from "$lib/stores/theme";
  import { useNavigation } from "$lib/hooks/useNavigation";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import LayoutToggle from "$lib/components/LayoutToggle.svelte";
  import { layout, type LayoutMode } from "$lib/stores/layout";
  import "../app.css";
  import type { LayoutData } from "./$types";

  const { children, data } = $props<{ data: LayoutData }>();

  // 在 layout 级别初始化 navigation context，确保所有页面都能访问
  useNavigation(data?.navigation);

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

  onMount(() => {
    favorites.init();
    // 初始化布局
    layout.init();
    // 初始化主题
    theme.init();
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
                ).format(new Date())
              }
            </span>
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
        <span class="footer-theme-hint">Light & Dark · 自适应颜色主题</span>
      </div>
    </div>
  </footer>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    padding: var(--spacing-xl) var(--spacing-lg);
    background: var(--app-background);
  }

  .container {
    width: 100%;
    max-width: 1200px;
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
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-lg);
    padding: calc(var(--spacing-sm) * 1.5) var(--spacing-lg);
    background: var(--surface-glass);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-soft);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transition: transform var(--transition-base), box-shadow var(--transition-base);
  }

  .header-shell:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }

  .logo {
    margin: 0;
    font-size: 1.625rem;
    font-weight: 720;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 65%, var(--primary-color-strong) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.04em;
  }

  .logo a {
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .nav {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    flex-wrap: wrap;
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
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.95rem;
    padding: calc(var(--spacing-xs) * 1.6) calc(var(--spacing-sm) * 1.6);
    border-radius: var(--radius-lg);
    letter-spacing: 0.015em;
    transition:
      color var(--transition-fast),
      background var(--transition-fast),
      transform var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .nav-link::after {
    content: "";
    position: absolute;
    left: calc(var(--spacing-2xs) * -1);
    right: calc(var(--spacing-2xs) * -1);
    bottom: calc(var(--spacing-2xs) * -1.5);
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, var(--border-accent), transparent);
    opacity: 0;
    transform: scaleX(0.6);
    transition: opacity var(--transition-fast), transform var(--transition-fast);
  }

  .nav-link:hover {
    color: var(--primary-color);
    background: var(--layer-primary-soft);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .nav-link:hover::after,
  .nav-link:focus-visible::after {
    opacity: 1;
    transform: scaleX(1);
  }

  .nav-link:focus-visible {
    outline: none;
    color: var(--primary-color);
    background: var(--layer-primary-soft);
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .main .container {
    background: var(--card-bg);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
    border: 1px solid var(--border-soft);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    transition: box-shadow var(--transition-base), transform var(--transition-base);
  }

  .main .container:hover {
    box-shadow: var(--shadow-lg);
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
    padding: clamp(var(--spacing-xl), 5vw, var(--spacing-2xl));
    border-radius: var(--radius-xl);
    background: linear-gradient(
        140deg,
        color-mix(in srgb, var(--surface-glass) 88%, transparent),
        color-mix(in srgb, var(--card-bg) 94%, transparent)
      );
    border: 1px solid color-mix(in srgb, var(--border-light) 82%, transparent);
    box-shadow: var(--shadow-soft);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    color: var(--text-secondary);
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
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    font-size: 0.72rem;
    background: color-mix(in srgb, var(--primary-light) 60%, transparent);
    color: var(--primary-color);
    border: 1px solid color-mix(in srgb, var(--primary-color) 28%, transparent);
    backdrop-filter: blur(8px);
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
    color: var(--text-secondary);
    font-weight: 500;
    text-decoration: none;
    padding: 0.25rem 0;
    transition: color var(--transition-fast), transform var(--transition-fast);
  }

  .footer-links a::after,
  .footer-contact a::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
    opacity: 0;
    transform: scaleX(0.5);
    transition: opacity var(--transition-fast), transform var(--transition-fast);
  }

  .footer-links a:hover,
  .footer-links a:focus-visible,
  .footer-contact a:hover,
  .footer-contact a:focus-visible {
    color: var(--primary-color);
    transform: translateY(-1px);
  }

  .footer-links a:hover::after,
  .footer-links a:focus-visible::after,
  .footer-contact a:hover::after,
  .footer-contact a:focus-visible::after {
    opacity: 1;
    transform: scaleX(1);
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
      padding: var(--spacing-lg) var(--spacing-sm);
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
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
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
      gap: var(--spacing-sm);
    }

    .nav-links {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--spacing-xs);
      width: 100%;
    }

    .nav-controls {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .nav-link {
      flex: none;
      font-size: 0.85rem;
      padding: var(--spacing-xs) var(--spacing-sm);
      margin: 0;
      text-align: center;
      border: 1px solid var(--border-light);
      background: var(--bg-secondary);
    }

    .nav-link::after {
      display: none;
    }

    .nav-link:hover,
    .nav-link:focus-visible {
      transform: none;
      box-shadow: none;
      background: var(--bg-secondary);
    }

    .main .container {
      padding: 0;
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
    .logo {
      font-size: 1.3rem;
    }

    .nav-links {
      grid-template-columns: 1fr;
    }

    .footer-shell {
      padding: var(--spacing-md) var(--spacing-sm);
    }
  }
</style>
