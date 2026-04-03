/**
 * StudyLayer Dashboard Design Tokens
 * Centralized design system constants for consistent styling across the application.
 * Matches the StudyLayer website design system.
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
    // Brand Colors
    brand: {
        primary: '#0ea5e9',      // Sky-500 - Main brand color
        primaryHover: '#0284c7', // Sky-600
        primaryLight: '#e0f2fe', // Sky-100
        secondary: '#6366f1',    // Indigo-500
        secondaryHover: '#4f46e5', // Indigo-600
        accent: '#8b5cf6',       // Violet-500
    },

    // Neutral/Slate Scale
    slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
    },

    // Semantic Colors
    semantic: {
        success: '#10b981',      // Emerald-500
        successLight: '#d1fae5', // Emerald-100
        warning: '#f59e0b',      // Amber-500
        warningLight: '#fef3c7', // Amber-100
        error: '#ef4444',        // Red-500
        errorLight: '#fee2e2',   // Red-100
        info: '#3b82f6',         // Blue-500
        infoLight: '#dbeafe',    // Blue-100
    },

    // Light Mode Background Colors
    light: {
        background: '#f8fafc',
        card: '#ffffff',
        cardAlt: '#fdfbf7',
        elevated: '#ffffff',
        glass: 'rgba(255, 255, 255, 0.8)',
        foreground: '#0f172a',
        foregroundSecondary: '#64748b',
        foregroundMuted: '#94a3b8',
        border: '#e2e8f0',
        borderLight: '#f1f5f9',
        borderStrong: '#cbd5e1',
    },

    // Dark Mode Background Colors
    dark: {
        background: '#0f172a',
        card: '#1e293b',
        cardAlt: '#1a202c',
        elevated: '#334155',
        glass: 'rgba(30, 41, 59, 0.8)',
        foreground: '#f8fafc',
        foregroundSecondary: '#94a3b8',
        foregroundMuted: '#64748b',
        border: '#334155',
        borderLight: '#1e293b',
        borderStrong: '#475569',
    },
} as const;

// ============================================================================
// SPACING SCALE
// ============================================================================

export const spacing = {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    32: '8rem',       // 128px
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const radius = {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    '4xl': '2.5rem',  // 40px
    full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

    // Colored shadows
    primary: '0 10px 40px -10px rgba(14, 165, 233, 0.3)',
    primaryStrong: '0 20px 40px -10px rgba(14, 165, 233, 0.4)',
    dark: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',

    // Card shadows
    card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
    fonts: {
        heading: "'Plus Jakarta Sans', sans-serif",
        body: "'Inter', sans-serif",
        mono: "'JetBrains Mono', monospace",
    },

    sizes: {
        xs: '0.75rem',     // 12px
        sm: '0.875rem',    // 14px
        base: '1rem',      // 16px
        lg: '1.125rem',    // 18px
        xl: '1.25rem',     // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
        '5xl': '3rem',     // 48px
        '6xl': '3.75rem',  // 60px
        '7xl': '4.5rem',   // 72px
    },

    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
    },

    lineHeights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
    },

    letterSpacings: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        ultrawide: '0.15em',
    },
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
    slower: '500ms ease',

    // Cubic beziers
    easeOut: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
    hide: -1,
    base: 0,
    raised: 10,
    dropdown: 100,
    sticky: 200,
    overlay: 300,
    modal: 400,
    popover: 500,
    tooltip: 600,
    max: 9999,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

// ============================================================================
// LAYOUT
// ============================================================================

export const layout = {
    sidebar: {
        width: '280px',
        collapsedWidth: '80px',
    },
    header: {
        height: '64px',
    },
    container: {
        maxWidth: '1280px',
        padding: '1.5rem',
    },
} as const;
