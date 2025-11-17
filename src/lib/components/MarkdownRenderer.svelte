<script lang="ts">
import { marked } from "marked";
import { loadMarkdownContent } from "../dataLoader";
import type { NavItem } from "../types";
import { page } from "$app/state";

interface Props {
  item: NavItem;
  markdownContent?: string; // 可选的预加载 markdown 内容
}

const markdownCache = new Map<string, string>();
const htmlCache = new Map<string, string>();
const EMPTY_HTML = "<p>暂无介绍</p>";

// 配置 marked（组件级别配置一次即可）
marked.setOptions({
  breaks: true,
  gfm: true,
});

let { item, markdownContent: preloadedContent }: Props = $props();

function resolveCacheKey(navItem: NavItem | undefined): string {
  if (!navItem?.group || !navItem?.desc_md) {
    return "";
  }
  return `${navItem.group}:${navItem.desc_md}`;
}

function getMarkdown(key: string, navItem: NavItem): string {
  // 如果提供了预加载的内容，优先使用
  if (preloadedContent !== undefined && preloadedContent !== null) {
    if (preloadedContent.trim()) {
      markdownCache.set(key, preloadedContent);
      return preloadedContent;
    }
    // 如果预加载的内容为空，也缓存空字符串，避免重复尝试加载
    markdownCache.set(key, "");
    return "";
  }
  
  // 回退到原来的逻辑：从缓存或文件系统加载
  if (markdownCache.has(key)) {
    return markdownCache.get(key) ?? "";
  }
  const content = loadMarkdownContent(navItem, page.data?.site?.domain);
  markdownCache.set(key, content);
  return content;
}

function getHtml(key: string, markdown: string): string {
  if (htmlCache.has(key)) {
    return htmlCache.get(key) ?? EMPTY_HTML;
  }
  const html = (marked.parse(markdown) as string) || EMPTY_HTML;
  htmlCache.set(key, html);
  return html;
}

const cacheKey = $derived(resolveCacheKey(item));

const markdownText = $derived.by(() => {
  if (!cacheKey || !item) {
    return "";
  }
  return getMarkdown(cacheKey, item);
});

const htmlContent = $derived.by(() => {
  if (!cacheKey || !item) {
    return EMPTY_HTML;
  }
  const markdown = markdownText;
  if (!markdown.trim()) {
    return EMPTY_HTML;
  }
  return getHtml(cacheKey, markdown);
});
</script>

<div class="markdown-content">
  {@html htmlContent || ""}
</div>

<style>
  .markdown-content {
    font-size: 0.95rem;
    line-height: 1.75;
    color: var(--text-secondary);
    display: grid;
    gap: 0.75rem;
  }

  .markdown-content :global(*) {
    max-width: 100%;
  }

  .markdown-content :global(h1),
  .markdown-content :global(h2),
  .markdown-content :global(h3),
  .markdown-content :global(h4),
  .markdown-content :global(h5),
  .markdown-content :global(h6) {
    margin: 1.5rem 0 0.75rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
    scroll-margin-top: 5rem;
  }

  .markdown-content :global(h1) {
    font-size: 1.75rem;
    letter-spacing: -0.01em;
  }

  .markdown-content :global(h2) {
    font-size: 1.5rem;
    letter-spacing: -0.01em;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 0.4rem;
  }

  .markdown-content :global(h3) {
    font-size: 1.25rem;
  }

  .markdown-content :global(h4) {
    font-size: 1.15rem;
  }

  .markdown-content :global(h5),
  .markdown-content :global(h6) {
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
  }

  .markdown-content :global(p) {
    margin: 0.25rem 0;
  }

  .markdown-content :global(strong) {
    font-weight: 600;
    color: var(--text-primary);
  }

  .markdown-content :global(em) {
    color: var(--text-primary);
  }

  .markdown-content :global(hr) {
    border: none;
    height: 1px;
    margin: 2rem 0;
    background-image: linear-gradient(
      90deg,
      transparent,
      var(--border-light),
      transparent
    );
  }

  .markdown-content :global(ul),
  .markdown-content :global(ol) {
    margin: 0.5rem 0 0.5rem 0;
    padding-left: 1.5rem;
    display: grid;
    gap: 0.35rem;
  }

  .markdown-content :global(li) {
    color: inherit;
  }

  .markdown-content :global(li::marker) {
    color: var(--primary-color);
  }

  .markdown-content :global(blockquote) {
    margin: 0.75rem 0;
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--primary-lighter);
    border-left: 3px solid var(--primary-color);
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    color: var(--text-primary);
    font-style: italic;
    border: 1px solid var(--border-light);
    border-left-width: 3px;
  }

  .markdown-content :global(code) {
    font-size: 0.85em;
    font-family:
      "Fira Code",
      "JetBrains Mono",
      Consolas,
      Monaco,
      "Courier New",
      monospace;
    background: var(--code-bg);
    padding: calc(var(--spacing-2xs) * 0.75) var(--spacing-xs);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-light);
    color: var(--text-primary);
  }

  .markdown-content :global(pre) {
    background: var(--code-bg);
    color: var(--text-primary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-xl);
    overflow-x: auto;
    margin: 0.75rem 0;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-xs);
  }

  .markdown-content :global(pre code) {
    background: transparent;
    border: 0;
    padding: 0;
    line-height: 1.6;
    font-size: 0.9rem;
    color: inherit;
  }

  .markdown-content :global(table) {
    width: 100%;
    border-collapse: collapse;
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-xs);
  }

  .markdown-content :global(th),
  .markdown-content :global(td) {
    padding: 0.65rem 0.9rem;
    text-align: left;
    border-bottom: 1px solid var(--border-light);
  }

  .markdown-content :global(thead th) {
    background: var(--primary-lighter);
    color: var(--text-primary);
    font-weight: 600;
  }

  .markdown-content :global(tbody tr:nth-child(2n)) {
    background: var(--bg-tertiary);
  }

  .markdown-content :global(img) {
    display: block;
    margin: 1rem auto;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
  }

  .markdown-content :global(figure) {
    margin: 1.5rem 0;
    text-align: center;
  }

  .markdown-content :global(figcaption) {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .markdown-content :global(a) {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px dashed var(--border-accent);
    transition:
      color var(--transition-fast),
      border-bottom-color var(--transition-fast);
  }

  .markdown-content :global(a:hover) {
    color: var(--primary-color-strong);
    border-bottom-color: currentColor;
  }

  .markdown-content :global(kbd) {
    display: inline-block;
    padding: calc(var(--spacing-2xs) * 0.75) var(--spacing-xs);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-light);
    background: var(--bg-tertiary);
    font-size: 0.75rem;
    font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
    color: var(--text-primary);
    box-shadow: var(--shadow-xs);
  }

  @media (max-width: 768px) {
    .markdown-content {
      font-size: 0.9375rem;
      line-height: 1.7;
    }

    .markdown-content :global(h1) {
      font-size: 1.5rem;
      margin-top: var(--spacing-lg);
      margin-bottom: var(--spacing-md);
    }

    .markdown-content :global(h2) {
      font-size: 1.25rem;
      margin-top: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      padding-bottom: var(--spacing-xs);
    }

    .markdown-content :global(h3) {
      font-size: 1.125rem;
      margin-top: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
    }

    .markdown-content :global(h4) {
      font-size: 1rem;
      margin-top: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
    }

    .markdown-content :global(h5),
    .markdown-content :global(h6) {
      font-size: 0.9375rem;
      margin-top: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
    }

    .markdown-content :global(p) {
      margin: var(--spacing-sm) 0;
    }

    .markdown-content :global(hr) {
      margin: var(--spacing-lg) 0;
    }

    .markdown-content :global(ul),
    .markdown-content :global(ol) {
      margin: var(--spacing-sm) 0;
      padding-left: 1.25rem;
      gap: var(--spacing-xs);
    }

    .markdown-content :global(blockquote) {
      margin: var(--spacing-sm) 0;
      padding: var(--spacing-sm) var(--spacing-md);
      border-left-width: 2px;
    }

    .markdown-content :global(code) {
      font-size: 0.8em;
      padding: 0.125rem 0.25rem;
    }

    .markdown-content :global(pre) {
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      margin: var(--spacing-md) 0;
    }

    .markdown-content :global(pre code) {
      font-size: 0.8125rem;
    }

    .markdown-content :global(table) {
      font-size: 0.875rem;
      border-radius: var(--radius-md);
      display: block;
      overflow-x: auto;
    }

    .markdown-content :global(th),
    .markdown-content :global(td) {
      padding: var(--spacing-xs) var(--spacing-sm);
      white-space: nowrap;
    }

    .markdown-content :global(img) {
      max-width: 100%;
      height: auto;
      margin: var(--spacing-md) auto;
      border-radius: var(--radius-md);
    }

    .markdown-content :global(figure) {
      margin: var(--spacing-md) 0;
    }

    .markdown-content :global(figcaption) {
      font-size: 0.8125rem;
      margin-top: var(--spacing-xs);
    }

    .markdown-content :global(kbd) {
      font-size: 0.6875rem;
      padding: 0.15rem 0.35rem;
    }
  }
</style>
