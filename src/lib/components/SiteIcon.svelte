<script lang="ts" module>
  const iconUrlCache = new Map<string, string>();
  const iconFailureCache = new Set<string>();
</script>

<script lang="ts">
  import { browser } from "$app/environment";
  import type { NavItem } from "$lib/types";
  import { ICON_CONFIG } from "$lib/constants";
  import { getFaviconCandidates } from "$lib/utils/icon";

  type IconAppearance = "default" | "muted";

  interface Props {
    item: NavItem;
    size?: number | null;
    radius?: number | string | null;
    appearance?: IconAppearance;
    interactive?: boolean;
    className?: string;
    imageClass?: string;
    placeholderClass?: string;
    timeout?: number;
    fallbackText?: string;
  }

  let {
    item,
    size = null,
    radius = null,
    appearance = "default",
    interactive = false,
    className = "",
    imageClass = "",
    placeholderClass = "",
    timeout = ICON_CONFIG.TIMEOUT,
    fallbackText,
  }: Props = $props();

  const iconCandidates = $derived(getFaviconCandidates(item.url, item.icon));
  const resetSignature = $derived(
    `${item.id}:${item.icon ?? ""}:${item.url}:${iconCandidates.join("|")}`,
  );
  const cacheKey = $derived(item.id || item.url || "");

  let currentIconIndex = $state(0);
  let cachedIconUrl = $state("");
  let activeIconUrl = $derived(cachedIconUrl || iconCandidates[currentIconIndex] || "");
  let hasError = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let imgElement = $state<HTMLImageElement | null>(null);
  let hostElement = $state<HTMLDivElement | null>(null);
  let isVisible = $state(!browser);

  const placeholderContent = $derived(
    (fallbackText ?? item.name?.[0] ?? "?").toUpperCase(),
  );

  function clearTimeoutIfNeeded() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function tryNextIcon() {
    clearTimeoutIfNeeded();

    if (cachedIconUrl) {
      return;
    }

    if (currentIconIndex < iconCandidates.length - 1) {
      currentIconIndex++;
    } else {
      hasError = true;
      if (cacheKey) {
        iconFailureCache.add(cacheKey);
      }
    }
  }

  function setupIconTimeout() {
    clearTimeoutIfNeeded();

    if (!isVisible || cachedIconUrl || !activeIconUrl || hasError) {
      return;
    }

    if (activeIconUrl && !hasError) {
      timeoutId = setTimeout(() => {
        if (imgElement && !imgElement.complete) {
          tryNextIcon();
        }
      }, timeout);
    }
  }

  $effect(() => {
    const _signature = resetSignature;
    const key = cacheKey;
    currentIconIndex = 0;
    cachedIconUrl = "";
    hasError = false;
    imgElement = null;
    clearTimeoutIfNeeded();

    if (key && iconUrlCache.has(key)) {
      cachedIconUrl = iconUrlCache.get(key) ?? "";
    } else if (key && iconFailureCache.has(key)) {
      hasError = true;
    }
  });

  $effect(() => {
    if (!browser) {
      return;
    }

    if (!hostElement || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          isVisible = true;
          observer.disconnect();
        }
      },
      { rootMargin: "150px" },
    );

    observer.observe(hostElement);
    return () => observer.disconnect();
  });

  $effect(() => {
    if (!isVisible) {
      clearTimeoutIfNeeded();
      return;
    }

    if (activeIconUrl && !hasError) {
      setupIconTimeout();
    }

    return () => {
      clearTimeoutIfNeeded();
    };
  });

  let dimensionStyle = $state("");

  $effect(() => {
    const styles: string[] = [];
    if (size !== null) {
      styles.push(
        `width:${size}px`,
        `height:${size}px`,
        `--site-icon-size:${size}px`,
      );
    }
    if (radius !== null && radius !== undefined) {
      const normalizedRadius =
        typeof radius === "number" ? `${radius}px` : String(radius);
      styles.push(`--site-icon-radius:${normalizedRadius}`, `border-radius:${normalizedRadius}`);
    }
    dimensionStyle = styles.join(";");
  });

  const appearanceClass = $derived(`site-icon--${appearance}`);
  const interactiveClass = $derived(interactive ? "site-icon--interactive" : "");
  const combinedClass = $derived<string>(
    ["site-icon", appearanceClass, interactiveClass, className]
      .filter((value) => value && value.length > 0)
      .join(" "),
  );
</script>

<div
  bind:this={hostElement}
  class={combinedClass}
  style={dimensionStyle}
  aria-hidden="true"
>
  {#if hasError || !isVisible || !activeIconUrl}
    <div class={`site-icon-placeholder ${placeholderClass}`.trim()}>
      {placeholderContent}
    </div>
  {:else}
    <img
      bind:this={imgElement}
      class={`site-icon-image ${imageClass}`.trim()}
      src={activeIconUrl}
      alt={item.name}
      loading="lazy"
      width={size ?? undefined}
      height={size ?? undefined}
      onload={() => {
        if (!cachedIconUrl) {
          cachedIconUrl = activeIconUrl;
          if (cacheKey) {
            iconUrlCache.set(cacheKey, activeIconUrl);
          }
        }
        clearTimeoutIfNeeded();
      }}
      onerror={() => {
        tryNextIcon();
      }}
    />
  {/if}
</div>

<style>
  .site-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    border-radius: var(--site-icon-radius, var(--radius-xl));
    background: var(--component-card-glass-bg, var(--gradient-brand-soft));
    border: 1px solid var(--component-card-glass-border, var(--border-accent));
    box-shadow: var(--component-card-glass-shadow, var(--shadow-xs));
    color: var(--primary-color);
    backdrop-filter: var(--component-card-glass-backdrop, blur(12px));
    -webkit-backdrop-filter: var(--component-card-glass-backdrop, blur(12px));
    transition: var(
      --component-card-glass-transition,
      all var(--transition-fast)
    );
  }

  .site-icon--muted {
    background: var(--component-card-default-bg, var(--bg-secondary));
    border: 1px solid var(--component-card-default-border, var(--border-light));
    color: var(--component-link-secondary-color, var(--text-secondary));
    box-shadow: var(--component-card-default-shadow, var(--shadow-xs));
  }

  .site-icon--interactive:hover {
    transform: scale(1.03);
    box-shadow: var(--component-card-glass-shadow-hover, var(--shadow-sm));
    border-color: var(--component-button-primary-border, var(--primary-color));
  }

  .site-icon-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .site-icon-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: calc(var(--site-icon-size, 56px) * 0.46);
    color: var(--component-link-secondary-color, currentColor);
  }

  .site-icon--muted .site-icon-placeholder {
    color: var(--component-link-secondary-color, var(--text-secondary));
  }
</style>

