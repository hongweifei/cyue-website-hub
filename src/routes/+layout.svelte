<script lang="ts">
	import { onMount } from 'svelte';
	import { favorites } from '$lib/stores/favorites';
	import { theme } from '$lib/stores/theme';
	import { useNavigation } from '$lib/hooks/useNavigation';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

	const { children, data } = $props<{ data: LayoutData }>();

	// 在 layout 级别初始化 navigation context，确保所有页面都能访问
	useNavigation(data?.navigation);

	function handleNavClick(event: MouseEvent, href: string) {
		// 如果当前已经在目标页面，不需要导航
		if ($page.url.pathname === href) {
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
		import('$lib/stores/layout').then(({ layout }) => {
			layout.init();
		});
		// 初始化主题
		theme.init();
	});
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="description" content="{data.site?.name} - 精选网站导航，快速找到你需要的网站" />
	<meta name="keywords" content="导航,网站导航,网址导航,导航网站" />
	<title>{data.site?.name}</title>
</svelte:head>

<div class="app">
	<header class="header">
		<div class="container">
			<h1 class="logo">
				<a href="/" data-sveltekit-preload-data="hover" onclick={(e) => handleNavClick(e, '/')}>🕊️ {data.site?.name}</a>
			</h1>
		<nav class="nav">
			<a href="/" class="nav-link" data-sveltekit-preload-data="hover" onclick={(e) => handleNavClick(e, '/')}>首页</a>
			<a href="/favorites" class="nav-link" data-sveltekit-preload-data="hover" onclick={(e) => handleNavClick(e, '/favorites')}>收藏</a>
			<ThemeToggle />
		</nav>
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
		</div>
	</footer>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.container {
		width: 100%;
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
	}

	.header {
		background: var(--header-bg);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--border-light);
		padding: var(--spacing-md) 0;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: var(--shadow-sm);
		transition: all var(--transition-base);
	}

	.header .container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.logo {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 800;
		background: linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.logo a {
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.nav {
		display: flex;
		gap: var(--spacing-xl);
		align-items: center;
	}

	.nav-link {
		color: var(--text-secondary);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9375rem;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-md);
		transition: all var(--transition-base);
		position: relative;
	}

	.nav-link:hover {
		color: var(--primary-color);
		background: var(--primary-light);
	}

	.nav-link:active {
		transform: scale(0.98);
	}

	.main {
		flex: 1;
		padding: var(--spacing-2xl) 0;
		min-height: calc(100vh - 200px);
	}

	.footer {
		background: var(--footer-bg);
		border-top: 1px solid var(--border-color);
		padding: var(--spacing-xl) 0;
		margin-top: auto;
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.container {
			padding: 0 var(--spacing-md);
		}

		.header {
			padding: var(--spacing-sm) 0;
		}

		.header .container {
			flex-wrap: wrap;
		}

		.logo {
			font-size: 1.375rem;
		}

		.nav {
			gap: var(--spacing-md);
			width: 100%;
			justify-content: center;
			padding-top: var(--spacing-sm);
			border-top: 1px solid var(--border-light);
		}

		.nav-link {
			font-size: 0.875rem;
			padding: var(--spacing-xs) var(--spacing-sm);
		}

		.main {
			padding: var(--spacing-lg) 0;
		}

		.footer {
			padding: var(--spacing-lg) 0;
			font-size: 0.8125rem;
		}
	}

	@media (max-width: 480px) {
		.logo {
			font-size: 1.25rem;
		}

		.nav {
			gap: var(--spacing-sm);
		}
	}
</style>
