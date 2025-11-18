<script lang="ts">
    import { theme } from "../stores/theme";
    import type { ThemeId, ThemeOption } from "../theme/config";
    import { getThemeOption, THEME_OPTIONS } from "../theme/config";
    import { DEFAULTS } from "../constants";

    const LIGHT_ICON =
        "M5 12a7 7 0 0 1 7-7 7 7 0 0 1 6.93 6.05 5 5 0 1 1-6.36 6.36A7 7 0 0 1 5 12Z";
    const DARK_ICON = "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z";

    let currentTheme: ThemeId = $state(DEFAULTS.THEME);
    let currentOption: ThemeOption = $derived.by(() =>
        getThemeOption(currentTheme),
    );
    let isOpen = $state(false);
    let buttonRef: HTMLButtonElement | null = $state(null);
    let panelRef: HTMLDivElement | null = $state(null);

    $effect(() => {
        const unsubscribe = theme.subscribe((value) => {
            currentTheme = value;
        });
        return unsubscribe;
    });

    function handleToggle() {
        isOpen = !isOpen;
    }

    function closePanel() {
        isOpen = false;
    }

    function handleSelect(id: ThemeId) {
        theme.set(id);
        closePanel();
    }

    function getModeLabel(mode: ThemeOption["mode"]): string {
        if (mode === "adaptive") return "跟随系统";
        if (mode === "dark") return "深色模式";
        return "浅色模式";
    }

    function getMetaText(option: ThemeOption): string {
        if (option.mode === "adaptive") return "智能自适应 · 鸿蒙配色";
        if (option.family === "harmony") return "鸿蒙设计语言";
        if (option.family === "glass") return "霓虹玻璃风格";
        if (option.family === "neo") return "赛博霓虹风格";
        if (option.family === "mono") return "留白纸感风格";
        return getModeLabel(option.mode);
    }

    $effect(() => {
        if (!isOpen || typeof document === "undefined") return;

        const handleClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                panelRef &&
                !panelRef.contains(target) &&
                buttonRef &&
                !buttonRef.contains(target)
            ) {
                closePanel();
            }
        };

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closePanel();
            }
        };

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKeydown);
        };
    });
</script>

<div class="theme-toggle-wrapper" data-open={isOpen}>
    <button
        type="button"
        class="theme-toggle-btn"
        data-mode={currentOption.mode}
        onclick={handleToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`切换主题，当前为 ${currentOption.label}`}
        bind:this={buttonRef}
    >
        <div class="icon-wrapper" aria-hidden="true">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                {#if currentOption.mode === "light"}
                    <path d={LIGHT_ICON} />
                    <circle cx="12" cy="12" r="4" />
                {:else if currentOption.mode === "dark"}
                    <path d={DARK_ICON} />
                {:else}
                    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
                    <circle cx="9" cy="9" r="2" />
                    <circle cx="15" cy="15" r="2" />
                    <line x1="9" y1="11" x2="9" y2="15" />
                    <line x1="15" y1="9" x2="15" y2="13" />
                {/if}
            </svg>
        </div>
		<div class="text-wrapper">
			<span class="theme-label">{currentOption.label}</span>
			<span class="theme-chip">{getModeLabel(currentOption.mode)}</span>
		</div>
    </button>

    {#if isOpen}
        <div
            class="theme-panel"
            role="menu"
            aria-label="主题选择"
            bind:this={panelRef}
        >
            {#each THEME_OPTIONS as option}
                <button
                    type="button"
                    class="theme-option"
                    onclick={() => handleSelect(option.id)}
                    data-selected={option.id === currentTheme}
                    role="menuitemradio"
                    aria-checked={option.id === currentTheme}
                >
                    <div
                        class="preview"
                        style={`background:${option.preview.background};border-color:${option.preview.border};`}
                    >
                        <span
                            class="preview-accent"
                            style={`background:${option.preview.accent};`}
                        ></span>
                    </div>
					<div class="option-text">
						<span class="option-label">
							{option.label}
							{#if option.badge}
								<em class="option-badge">{option.badge}</em>
							{/if}
						</span>
						<span class="option-desc">{option.description}</span>
						{#if option.features?.length}
							<span class="option-features">
								{#each option.features as feature}
									<em>{feature}</em>
								{/each}
							</span>
						{/if}
					</div>
					<span class="option-mode">{getModeLabel(option.mode)}</span>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .theme-toggle-wrapper {
        position: relative;
        display: inline-flex;
        /* 确保 wrapper 在正确的层级，以便弹出面板可以显示 */
        z-index: 1;
    }

    .theme-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: 0 var(--spacing-md);
        height: 38px;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-full);
        color: var(--text-primary);
        cursor: pointer;
        transition: all var(--transition-fast);
        box-shadow: var(--shadow-xs);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        min-width: auto;
    }

    .theme-toggle-btn[data-mode="dark"] {
        background: color-mix(
            in srgb,
            var(--bg-tertiary) 80%,
            rgba(56, 56, 78, 0.65)
        );
        color: var(--text-secondary);
        border-color: color-mix(
            in srgb,
            var(--border-light) 75%,
            rgba(255, 255, 255, 0.18)
        );
    }

    .theme-toggle-btn[data-mode="adaptive"] {
        border-color: var(--border-accent);
    }

    .theme-toggle-btn:hover {
        border-color: var(--border-accent);
        background: var(--bg-secondary);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
    }

    .theme-toggle-btn:active {
        transform: translateY(0);
        box-shadow: var(--shadow-xs);
    }

    .icon-wrapper {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: var(--radius-full);
        background: var(--primary-lighter);
        color: var(--primary-color);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
    }

    .theme-toggle-btn[data-mode="dark"] .icon-wrapper {
        background: rgba(56, 189, 248, 0.1);
        color: #38bdf8;
    }

    .theme-toggle-btn[data-mode="adaptive"] .icon-wrapper {
        background: linear-gradient(
            120deg,
            rgba(45, 212, 191, 0.15),
            rgba(79, 70, 229, 0.18)
        );
        color: #38bdf8;
    }

    .icon-wrapper svg {
        flex-shrink: 0;
    }

    .text-wrapper {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        line-height: 1.1;
    }

    .theme-label {
        font-size: 0.88rem;
        font-weight: 500;
        color: var(--text-primary);
        letter-spacing: 0.01em;
    }

    .theme-chip {
        font-size: 0.72rem;
        color: var(--text-tertiary);
        border: 1px solid color-mix(in srgb, var(--text-tertiary) 35%, transparent);
        border-radius: var(--radius-full);
        padding: 0 0.35rem;
        line-height: 1.4;
    }

    .theme-panel {
        position: absolute;
        top: calc(100% + var(--spacing-xs));
        right: 0;
        min-width: 360px;
        max-width: 420px;
        padding: var(--spacing-md);
        background: var(--bg-elevated, var(--bg-primary));
        border: 1px solid var(--border-light);
        border-radius: var(--radius-3xl, 28px);
        box-shadow: var(--shadow-lg, 0 35px 65px rgba(15, 23, 42, 0.25));
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        /* 确保弹出面板在 header 之上，header 的 z-index 是 100 */
        z-index: 101;
    }

    .theme-option {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: var(--spacing-md);
        align-items: center;
        width: 100%;
        padding: var(--spacing-sm) var(--spacing-sm);
        border-radius: var(--radius-2xl);
        border: 1px solid transparent;
        background: rgba(255, 255, 255, 0.01);
        cursor: pointer;
        color: var(--text-secondary);
        transition:
            border var(--transition-fast),
            background var(--transition-fast),
            color var(--transition-fast),
            transform var(--transition-fast);
    }

    .theme-option:hover {
        border-color: var(--border-accent);
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .theme-option[data-selected="true"] {
        border-color: var(--border-accent);
        background: color-mix(in srgb, var(--primary-lighter) 60%, transparent);
        color: var(--text-primary);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
    }

    .preview {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-2xl);
        border: 1px solid;
        display: grid;
        place-items: center;
        position: relative;
        overflow: hidden;
    }

    .preview-accent {
        width: 80%;
        height: 4px;
        border-radius: var(--radius-full);
    }

    .option-text {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        text-align: left;
    }

    .option-label {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
        display: inline-flex;
        gap: 0.4rem;
        align-items: center;
    }

    .option-label em,
    .option-badge {
        font-style: normal;
        font-size: 0.7rem;
        padding: 0 0.35rem;
        border-radius: var(--radius-full);
        border: 1px solid color-mix(in srgb, var(--primary-color) 45%, transparent);
        color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-lighter) 25%, transparent);
    }
    
    .option-desc {
        font-size: 0.8rem;
        color: var(--text-tertiary);
    }

    .option-features {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
    }

    .option-mode {
        font-size: 0.75rem;
        color: var(--text-tertiary);
    }

    @media (max-width: 768px) {
        .theme-toggle-btn {
            min-width: auto;
            padding: 0 var(--spacing-sm);
            height: 34px;
        }

		.text-wrapper {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 0;
			line-height: 1.1;
		}

		.theme-chip {
			display: none;
		}

        .icon-wrapper {
            width: 26px;
            height: 26px;
        }

        .theme-panel {
            position: fixed;
            top: calc(var(--header-height, 64px) + var(--spacing-md));
            left: 50%;
            transform: translateX(-50%);
            right: auto;
            width: min(360px, calc(100vw - var(--spacing-lg)));
            max-height: calc(100vh - var(--spacing-xl));
            overflow-y: auto;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-2xl);
        }

		.theme-option {
			grid-template-columns: auto 1fr auto;
			gap: var(--spacing-sm);
			padding: var(--spacing-xs) var(--spacing-sm);
		}

		.preview {
			display: grid;
			width: 40px;
			height: 40px;
			border-radius: var(--radius-xl);
		}

		.option-desc {
			display: block;
			font-size: 0.72rem;
			color: var(--text-tertiary);
			line-height: 1.3;
		}

		.option-features {
			display: none;
		}
    }
</style>
