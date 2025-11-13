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
      <p>&copy; 2025 {data?.site?.name}. 让导航更简单。</p>
      <p>Powered by <a href="https://gitee.com/hongweifei/cyue-website-hub">cyue-website-hub</a></p>
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
    border-radius: var(--radius-lg);
    background: var(--footer-bg);
    border: 1px solid var(--border-light);
    padding: var(--spacing-lg);
    margin-top: auto;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
    box-shadow: var(--shadow-sm);
  }

  .footer a {
    color: var(--primary-color);
    font-weight: 600;
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

    .footer {
      font-size: 0.8rem;
      padding: var(--spacing-md);
    }
  }

  @media (max-width: 480px) {
    .logo {
      font-size: 1.3rem;
    }

    .nav-links {
      grid-template-columns: 1fr;
    }
  }
</style>
