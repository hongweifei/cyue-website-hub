<script lang="ts">
  import { marked } from "marked";
  import { loadMarkdownContent } from "../dataLoader";
  import type { NavItem } from "../types";

  interface Props {
    item: NavItem;
  }

  let { item }: Props = $props();

  // 加载 Markdown 内容
  const markdownText = loadMarkdownContent(item);

  // 配置 marked
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // 转换为 HTML
  const htmlContent: string = markdownText
    ? (marked.parse(markdownText) as string)
    : "<p>暂无介绍</p>";
</script>

<div class="markdown-content">
  {@html htmlContent || ""}
</div>

<style>
  .markdown-content {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--text-secondary, #4b5563);
  }

  .markdown-content :global(h1),
  .markdown-content :global(h2),
  .markdown-content :global(h3) {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
  }

  .markdown-content :global(p) {
    margin: 0.5rem 0;
  }

  .markdown-content :global(ul),
  .markdown-content :global(ol) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .markdown-content :global(li) {
    margin: 0.25rem 0;
  }

  .markdown-content :global(strong) {
    font-weight: 600;
    color: var(--text-primary, #111827);
  }

  .markdown-content :global(code) {
    background: var(--code-bg, #f3f4f6);
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-size: 0.875em;
  }

  .markdown-content :global(pre) {
    background: var(--code-bg, #f3f4f6);
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 0.5rem 0;
  }

  .markdown-content :global(a) {
    color: var(--primary-color, #3b82f6);
    text-decoration: none;
  }

  .markdown-content :global(a:hover) {
    text-decoration: underline;
  }
</style>
