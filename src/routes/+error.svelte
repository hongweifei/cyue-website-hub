<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  export let error: App.Error | null = page.error;
  export let status: number = page.status;

  function handleBack() {
    history.length > 1 ? history.back() : goto("/");
  }
</script>

<svelte:head>
  <title>{status} 出现了一些问题 | {page.data?.site?.name}</title>
</svelte:head>

<section class="error-page" role="alert">
  <div class="error-hero" aria-hidden="true"></div>
  <div class="error-content">
    <span class="error-code">{status}</span>
    <h1>抱歉，页面无法正常加载</h1>
    <p class="error-message">
      {error?.message ?? "我们正在努力修复，请稍后重试。"}
    </p>
    <div class="actions">
      <button type="button" class="primary" onclick={() => goto("/")}>返回首页</button>
      <button type="button" class="secondary" onclick={handleBack}>返回上一页</button>
    </div>
  </div>
  <div class="error-links card">
    <h2>你可以：</h2>
    <ul>
      <li><a href="/">回到导航主页</a></li>
      <li><a href="/favorites">查看我的收藏</a></li>
      {#if page.data?.site?.contactEmail}
        <li><a href="mailto:{page.data?.site?.contactEmail}">联系维护者</a></li>
      {/if}
    </ul>
  </div>
</section>

<style>
  .error-page {
    position: relative;
    min-height: calc(100vh - 120px);
    padding: clamp(var(--spacing-lg), 6vw, var(--spacing-2xl));
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: clamp(var(--spacing-lg), 4vw, var(--spacing-2xl));
    align-items: center;
    isolation: isolate;
  }

  .error-hero {
    position: absolute;
    inset: clamp(12px, 3vw, 24px);
    border-radius: var(--radius-xl);
    background: var(--gradient-brand-soft);
    opacity: 0.65;
    filter: blur(36px);
    z-index: -2;
  }

  .error-content,
  .card {
    backdrop-filter: blur(22px);
    background: linear-gradient(
        140deg,
        color-mix(in srgb, var(--surface-glass) 88%, transparent),
        color-mix(in srgb, var(--card-bg) 90%, transparent)
      );
    border: 1px solid color-mix(in srgb, var(--border-soft) 80%, transparent);
    border-radius: var(--radius-xl);
    padding: clamp(var(--spacing-lg), 5vw, var(--spacing-2xl));
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .error-code {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: var(--gradient-brand);
    color: var(--text-inverse);
    font-weight: 700;
    font-size: 1.75rem;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    color: var(--text-primary);
  }

  .error-message {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.7;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .actions button {
    padding: 0.65rem 1.4rem;
    border-radius: var(--radius-lg);
    font-weight: 600;
    cursor: pointer;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .actions button.primary {
    border: none;
    background: var(--gradient-brand);
    color: var(--text-inverse);
    box-shadow: var(--shadow-sm);
  }

  .actions button.primary:focus-visible {
    outline: 2px solid var(--accent-color);
    outline-offset: 3px;
  }

  .actions button.primary:hover,
  .actions button.primary:focus-visible {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }

  .actions button.secondary {
    border: 1px solid var(--border-light);
    background: var(--surface-glass);
    color: var(--text-secondary);
  }

  .actions button.secondary:hover,
  .actions button.secondary:focus-visible {
    border-color: var(--border-accent);
    color: var(--primary-color);
    background: var(--layer-primary-soft);
    transform: translateY(-1px);
  }

  .actions button.secondary:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--primary-color) 35%, transparent);
    outline-offset: 3px;
  }

  .error-links h2 {
    margin: 0 0 var(--spacing-md);
    font-size: 1.15rem;
    color: var(--text-primary);
  }

  .error-links ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
  }

  .error-links li {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: calc(var(--spacing-sm) + 4px) var(--spacing-lg);
    border-radius: var(--radius-lg);
    background: linear-gradient(
        120deg,
        color-mix(in srgb, var(--surface-glass) 85%, transparent),
        color-mix(in srgb, var(--layer-primary-soft) 35%, transparent)
      );
    border: 1px solid color-mix(in srgb, var(--border-light) 75%, transparent);
    box-shadow: 0 12px 32px rgba(10, 89, 247, 0.08);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
  }

  .error-links li::before {
    content: "";
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--accent-color);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-color) 28%, transparent);
  }

  .error-links li:hover,
  .error-links li:focus-within {
    transform: translateY(-2px);
    border-color: var(--border-accent);
    box-shadow: var(--shadow-sm);
  }

  .error-links a {
    flex: 1;
    color: var(--primary-color);
  }

  .error-links a:hover,
  .error-links a:focus-visible {
    color: var(--primary-hover);
    text-decoration: none;
  }

  @media (max-width: 768px) {
    .error-page {
      padding: var(--spacing-xl) var(--spacing-sm) var(--spacing-2xl);
      gap: var(--spacing-xl);
      grid-template-columns: 1fr;
    }

    .error-hero {
      display: none;
    }

    .error-content,
    .card {
      padding: 0;
      background: none;
      border: none;
      box-shadow: none;
      backdrop-filter: none;
    }

    .error-content {
      gap: var(--spacing-md);
    }

    .error-code {
      width: 64px;
      height: 64px;
      font-size: 1.5rem;
    }

    .actions {
      flex-direction: column;
      align-items: stretch;
    }

    .actions button {
      width: 100%;
    }

    .error-links li {
      padding: var(--spacing-sm) var(--spacing-md);
      background: none;
      border: none;
      box-shadow: none;
    }

    .error-links li::before {
      box-shadow: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .actions button {
      transition: none;
    }
  }
</style>
