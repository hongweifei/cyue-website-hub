<script lang="ts">
    import { theme } from "../stores/theme";
    import type { ThemeId, ThemeOption } from "../theme/config";
    import { getThemeOption, THEME_OPTIONS } from "../theme/config";
    import { DEFAULTS } from "../constants";

    // 现代化的浅色模式图标 - 太阳与光线
    const LIGHT_ICON = [
        // 太阳中心
        "M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
        // 太阳圆形
        "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10"
    ].join('|');

    // 精致的深色模式图标 - 新月与星星
    const DARK_ICON = [
        // 新月主体
        "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
        // 装饰星星
        "M7 21l1.5-4.5L13 15l-4.5 1.5L7 21l-1.5-4.5L1 15l4.5-1.5L7 3l1.5 4.5L13 9l-4.5 1.5L7 21z"
    ].join('|');

    // 智能自适应图标 - 切换符号与齿轮
    const ADAPTIVE_ICON = [
        // 外圆环
        "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2",
        // 内部切换箭头
        "M12 7v5l4 2M12 17v-5l-4-2",
        // 齿轮装饰
        "M19.5 7.5l-1.5-1.5M16.5 4.5l-1.5 1.5M7.5 4.5l1.5 1.5M4.5 7.5l1.5 1.5M4.5 16.5l1.5-1.5M7.5 19.5l1.5-1.5M16.5 19.5l-1.5-1.5M19.5 16.5l-1.5-1.5"
    ].join('|');

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
                    <!-- 太阳光线 -->
                    <g class="light-rays">
                        {#each LIGHT_ICON.split('|') as path, i}
                            <path d={path} class="light-ray-{i}" />
                        {/each}
                    </g>
                {:else if currentOption.mode === "dark"}
                    <!-- 月亮与星星 -->
                    <g class="dark-elements">
                        {#each DARK_ICON.split('|') as path, i}
                            <path d={path} class="dark-element-{i}" />
                        {/each}
                    </g>
                {:else}
                    <!-- 自适应图标 -->
                    <g class="adaptive-elements">
                        {#each ADAPTIVE_ICON.split('|') as path, i}
                            <path d={path} class="adaptive-element-{i}" />
                        {/each}
                    </g>
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
                        class="preview-container"
                        style={`--preview-bg:${option.preview.background};--preview-border:${option.preview.border};--preview-accent:${option.preview.accent};`}
                    >
                        <div class="preview">
                            <!-- 背景层 -->
                            <div class="preview-background" style="background: var(--preview-bg);"></div>
                            <!-- 装饰元素层 -->
                            <div class="preview-decorations">
                                <!-- 顶部装饰条 -->
                                <div class="preview-top-bar" style="background: var(--preview-accent);"></div>
                                <!-- 卡片元素 -->
                                <div class="preview-card">
                                    <div class="preview-card-header"></div>
                                    <div class="preview-card-body">
                                        <div class="preview-text-line primary"></div>
                                        <div class="preview-text-line secondary"></div>
                                        <div class="preview-text-line tertiary"></div>
                                    </div>
                                </div>
                                <!-- 悬浮按钮 -->
                                <div class="preview-fab" style="background: var(--preview-accent);">
                                    <div class="preview-fab-icon"></div>
                                </div>
                            </div>
                            <!-- 边框层 -->
                            <div class="preview-border" style="border-color: var(--preview-border);"></div>
                        </div>
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
        padding: var(--component-button-secondary-padding, 0 var(--spacing-md));
        height: 38px;
        background: var(--component-button-secondary-bg, var(--bg-tertiary));
        border: 1px solid var(--component-button-secondary-border, var(--border-light));
        border-radius: var(--component-button-secondary-radius, var(--radius-full));
        color: var(--component-button-secondary-color, var(--text-primary));
        cursor: pointer;
        transition: var(
            --component-button-secondary-transition,
            all var(--transition-fast)
        );
        box-shadow: var(--component-button-secondary-shadow, var(--shadow-xs));
        backdrop-filter: var(--component-button-secondary-backdrop, blur(12px));
        -webkit-backdrop-filter: var(--component-button-secondary-backdrop, blur(12px));
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
        border-color: var(--component-button-secondary-border-hover, var(--border-accent));
        background: var(--component-button-secondary-bg-hover, var(--bg-secondary));
        color: var(--component-button-secondary-color-hover, var(--primary-color));
        transform: translateY(-1px);
        box-shadow: var(--component-button-secondary-shadow-hover, var(--shadow-sm));
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
        border-radius: var(--component-tag-default-radius, var(--radius-full));
        background: var(--component-tag-primary-bg, var(--primary-lighter));
        color: var(--component-tag-primary-color, var(--primary-color));
        box-shadow: var(--component-tag-primary-shadow, inset 0 1px 0 rgba(255, 255, 255, 0.45));
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
        overflow: visible;
    }

    /* 浅色模式图标动画 */
    .light-rays .light-ray-0 {
        animation: rotate 20s linear infinite;
        transform-origin: center;
    }

    .light-rays .light-ray-1 {
        animation: pulse 2s ease-in-out infinite;
    }

    /* 深色模式图标动画 */
    .dark-elements .dark-element-1 {
        animation: twinkle 3s ease-in-out infinite;
        transform-origin: center;
    }

    /* 自适应模式图标动画 */
    .adaptive-elements {
        animation: rotate 30s linear infinite;
        transform-origin: center;
    }

    .adaptive-elements .adaptive-element-1 {
        animation: pulse-glow 2s ease-in-out infinite;
    }

    .adaptive-elements .adaptive-element-2 {
        animation: spin 4s linear infinite;
        transform-origin: center;
    }

    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }

    @keyframes pulse-glow {
        0%, 100% { 
            opacity: 1;
            stroke-width: 1.8;
        }
        50% { 
            opacity: 0.6;
            stroke-width: 2.5;
        }
    }

    @keyframes twinkle {
        0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
        }
        50% { 
            opacity: 1;
            transform: scale(1.2);
        }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
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
        color: var(--component-badge-default-color, var(--text-tertiary));
        border: 1px solid var(--component-badge-default-border, color-mix(in srgb, var(--text-tertiary) 35%, transparent));
        border-radius: var(--component-badge-default-radius, var(--radius-full));
        padding: var(--component-badge-default-padding, 0 0.35rem);
        line-height: 1.4;
        background: var(--component-badge-default-bg, transparent);
    }

    .theme-panel {
        position: absolute;
        top: calc(100% + var(--spacing-xs));
        right: 0;
        min-width: 360px;
        max-width: 420px;
        max-height: calc(100vh - 120px);
        padding: var(--component-card-glass-padding, var(--spacing-md));
        background: var(--component-card-glass-bg, var(--bg-elevated, var(--bg-primary)));
        border: 1px solid var(--component-card-glass-border, var(--border-light));
        border-radius: var(--component-card-glass-radius, var(--radius-3xl, 28px));
        box-shadow: var(--component-card-glass-shadow, var(--shadow-lg, 0 35px 65px rgba(15, 23, 42, 0.25)));
        backdrop-filter: var(--component-card-glass-backdrop, blur(20px));
        -webkit-backdrop-filter: var(--component-card-glass-backdrop, blur(20px));
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        overflow-y: auto;
        overflow-x: hidden;
        transition: var(--component-card-glass-transition, border-color var(--transition-base));
        /* 确保弹出面板在 header 之上，header 的 z-index 是 100 */
        z-index: 101;
    }

    /* 自定义滚动条样式 */
    @supports (scrollbar-width: thin) {
        .theme-panel {
            scrollbar-width: thin;
            scrollbar-color: var(--border-soft) transparent;
        }
    }

    .theme-panel::-webkit-scrollbar {
        width: 6px;
    }

    .theme-panel::-webkit-scrollbar-track {
        background: transparent;
        border-radius: var(--radius-md);
    }

    .theme-panel::-webkit-scrollbar-thumb {
        background: var(--border-soft);
        border-radius: var(--radius-md);
        transition: background var(--transition-fast);
    }

    .theme-panel::-webkit-scrollbar-thumb:hover {
        background: var(--border-color);
    }

    .theme-option {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: var(--spacing-md);
        align-items: center;
        width: 100%;
        padding: var(--component-button-ghost-padding, var(--spacing-sm) var(--spacing-sm));
        border-radius: var(--component-button-ghost-radius, var(--radius-2xl));
        border: 1px solid var(--component-button-ghost-border, transparent);
        background: var(--component-button-ghost-bg, rgba(255, 255, 255, 0.01));
        cursor: pointer;
        color: var(--component-button-ghost-color, var(--text-secondary));
        transition: var(
            --component-button-ghost-transition,
            border var(--transition-fast),
            background var(--transition-fast),
            color var(--transition-fast),
            transform var(--transition-fast)
        );
    }

    .theme-option:hover {
        border-color: var(--component-button-ghost-border-hover, var(--border-accent));
        background: var(--component-button-ghost-bg-hover, var(--bg-secondary));
        color: var(--component-button-ghost-color-hover, var(--text-primary));
        transform: translateY(-1px);
    }

    .theme-option:hover .preview {
        transform: perspective(200px) rotateY(5deg) rotateX(-5deg) scale(1.05);
    }

    .theme-option:hover .preview-fab {
        transform: scale(1.1);
    }

    .theme-option:hover .preview-card {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .theme-option[data-selected="true"] {
        border-color: var(--component-button-secondary-border, var(--border-accent));
        background: var(--component-button-secondary-bg, color-mix(in srgb, var(--primary-lighter) 60%, transparent));
        color: var(--component-button-secondary-color, var(--text-primary));
        box-shadow: var(--component-button-secondary-shadow, inset 0 0 0 1px rgba(255, 255, 255, 0.35));
    }

    .theme-option[data-selected="true"] .preview {
        transform: scale(1.05);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .theme-option[data-selected="true"] .preview-fab {
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.15);
            opacity: 0.9;
        }
    }

    .preview-container {
        width: 60px;
        height: 60px;
        position: relative;
        box-sizing: border-box;
    }

    .preview {
        width: 100%;
        height: 100%;
        border-radius: var(--radius-2xl);
        position: relative;
        overflow: hidden;
        transform-style: preserve-3d;
        transition: transform var(--transition-base);
        box-sizing: border-box;
    }

    .preview-background {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: inherit;
    }

    .preview-decorations {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        box-sizing: border-box;
    }

    .preview-top-bar {
        height: 2.5px;
        border-radius: 2px;
        width: 35%;
        margin-left: auto;
        margin-right: 3px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    .preview-card {
        flex: 1;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        border: 0.5px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .preview-card-header {
        height: 7px;
        background: rgba(255, 255, 255, 0.15);
        border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
    }

    .preview-card-body {
        flex: 1;
        padding: 3px;
        display: flex;
        flex-direction: column;
        gap: 1px;
    }

    .preview-text-line {
        height: 1.5px;
        border-radius: 1px;
        background: rgba(255, 255, 255, 0.25);
    }

    .preview-text-line.primary {
        width: 70%;
        background: rgba(255, 255, 255, 0.35);
    }

    .preview-text-line.secondary {
        width: 85%;
    }

    .preview-text-line.tertiary {
        width: 60%;
    }

    .preview-fab {
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 10px;
        height: 10px;
        border-radius: var(--radius-full);
        display: grid;
        place-items: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }

    .preview-fab-icon {
        width: 5px;
        height: 5px;
        background: rgba(255, 255, 255, 0.9);
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2v20M17 7l-5-5-5 5M17 17l-5 5-5-5'/%3E%3C/svg%3E") center/contain no-repeat;
        -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2v20M17 7l-5-5-5 5M17 17l-5 5-5-5'/%3E%3C/svg%3E") center/contain no-repeat;
    }

    .preview-border {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        border: 1px solid;
        pointer-events: none;
        box-sizing: border-box;
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
        padding: var(--component-badge-primary-padding, 0 0.35rem);
        border-radius: var(--component-badge-primary-radius, var(--radius-full));
        border: 1px solid var(--component-badge-primary-border, color-mix(in srgb, var(--primary-color) 45%, transparent));
        color: var(--component-badge-primary-color, var(--primary-color));
        background: var(--component-badge-primary-bg, color-mix(in srgb, var(--primary-lighter) 25%, transparent));
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
            width: 24px;
            height: 24px;
        }

        .icon-wrapper svg {
            width: 20px;
            height: 20px;
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
			grid-template-columns: auto 1fr;
			gap: var(--spacing-xs);
			padding: var(--spacing-xs) var(--spacing-sm);
			align-items: center;
		}

		/* 移动端简化预览 - 移除边框层 */
		.preview-container {
			width: 48px;
			height: 48px;
		}

		.preview-border {
			display: none;
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

		.option-mode {
			display: none;
		}
    }
</style>
