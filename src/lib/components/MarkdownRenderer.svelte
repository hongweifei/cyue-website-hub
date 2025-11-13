<script lang="ts">
import { marked } from "marked";
import { loadMarkdownContent } from "../dataLoader";
import type { NavItem } from "../types";

interface Props {
  item: NavItem;
}

const markdownCache = new Map<string, string>();
const htmlCache = new Map<string, string>();
const EMPTY_HTML = "<p>暂无介绍</p>";

// 配置 marked（组件级别配置一次即可）
marked.setOptions({
  breaks: true,
  gfm: true,
});

let { item }: Props = $props();

function resolveCacheKey(navItem: NavItem | undefined): string {
  if (!navItem?.group || !navItem?.desc_md) {
    return "";
  }
  return `${navItem.group}:${navItem.desc_md}`;
}

function getMarkdown(key: string, navItem: NavItem): string {
  if (markdownCache.has(key)) {
    return markdownCache.get(key) ?? "";
  }
  const content = loadMarkdownContent(navItem);
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
    padding: 0.75rem 1rem;
    background: var(--layer-primary-soft);
    border-left: 3px solid var(--primary-color);
    border-radius: 0 0.5rem 0.5rem 0;
    color: var(--text-primary);
    font-style: italic;
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
    background: var(--chip-contrast-surface);
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    border: 1px solid var(--border-accent);
    color: var(--text-primary);
  }

  .markdown-content :global(pre) {
    background: var(--surface-solid);
    color: var(--text-primary);
    padding: 1rem;
    border-radius: 0.75rem;
    overflow-x: auto;
    margin: 0.75rem 0;
    border: 1px solid var(--border-soft);
    box-shadow: var(--shadow-sm);
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
    border-radius: 0.75rem;
    overflow: hidden;
    border: 1px solid var(--border-light);
  }

  .markdown-content :global(th),
  .markdown-content :global(td) {
    padding: 0.65rem 0.9rem;
    text-align: left;
    border-bottom: 1px solid var(--border-light);
  }

  .markdown-content :global(thead th) {
    background: var(--layer-primary-soft);
    color: var(--text-primary);
    font-weight: 600;
  }

  .markdown-content :global(tbody tr:nth-child(2n)) {
    background: var(--bg-tertiary);
  }

  .markdown-content :global(img) {
    display: block;
    margin: 1rem auto;
    border-radius: 0.75rem;
    box-shadow: var(--shadow-md);
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
    padding: 0.2rem 0.45rem;
    border-radius: 6px;
    border: 1px solid var(--border-light);
    background: var(--chip-contrast-surface);
    font-size: 0.75rem;
    font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
    color: var(--text-primary);
    box-shadow: inset 0 -1px 0 var(--chip-contrast-surface-strong);
  }
</style>
