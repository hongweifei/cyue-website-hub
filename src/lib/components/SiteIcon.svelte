<script lang="ts">
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

  let currentIconIndex = $state(0);
  let currentIconUrl = $derived(iconCandidates[currentIconIndex] || "");
  let hasError = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let imgElement = $state<HTMLImageElement | null>(null);

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

    if (currentIconIndex < iconCandidates.length - 1) {
      currentIconIndex++;
    } else {
      hasError = true;
    }
  }

  function setupIconTimeout() {
    clearTimeoutIfNeeded();

    if (currentIconUrl && !hasError) {
      timeoutId = setTimeout(() => {
        if (imgElement && !imgElement.complete) {
          tryNextIcon();
        }
      }, timeout);
    }
  }

  $effect(() => {
    const _signature = resetSignature;
    currentIconIndex = 0;
    hasError = false;
    imgElement = null;
    clearTimeoutIfNeeded();
  });

  $effect(() => {
    if (currentIconUrl && !hasError) {
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
  class={combinedClass}
  style={dimensionStyle}
  aria-hidden="true"
>
  {#if hasError || !currentIconUrl}
    <div class={`site-icon-placeholder ${placeholderClass}`.trim()}>
      {placeholderContent}
    </div>
  {:else}
    <img
      bind:this={imgElement}
      class={`site-icon-image ${imageClass}`.trim()}
      src={currentIconUrl}
      alt={item.name}
      loading="lazy"
      width={size ?? undefined}
      height={size ?? undefined}
      onload={() => {
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
    border-radius: var(--site-icon-radius, 14px);
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.15),
      rgba(59, 130, 246, 0.35)
    );
    border: 2px solid rgba(148, 163, 184, 0.45);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    color: var(--primary-color, #3b82f6);
    transition:
      transform var(--transition-fast, 0.18s ease),
      box-shadow var(--transition-fast, 0.18s ease);
  }

  .site-icon--muted {
    background: linear-gradient(
      135deg,
      var(--icon-bg, #f3f4f6) 0%,
      #e5e7eb 100%
    );
    border: 2px solid rgba(255, 255, 255, 0.8);
    color: var(--text-secondary, #6b7280);
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  }

  .site-icon--interactive:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.14);
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
    color: currentColor;
  }

  .site-icon--muted .site-icon-placeholder {
    color: var(--text-secondary, #6b7280);
  }
</style>

