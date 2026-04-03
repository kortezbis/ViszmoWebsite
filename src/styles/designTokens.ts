/**
 * StudyLayer Design Tokens
 * Centralized design system constants for consistent styling across the application.
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

    // Background Colors
    background: {
        page: '#F8FAFC',         // Main page background
        card: '#ffffff',
        cardAlt: '#fdfbf7',      // Paper/cream style
        dark: '#0f172a',         // Slate-900
        glass: 'rgba(255, 255, 255, 0.8)',
    },

    // Text Colors
    text: {
        primary: '#0f172a',      // Slate-900
        secondary: '#64748b',    // Slate-500
        muted: '#94a3b8',        // Slate-400
        inverse: '#ffffff',
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
    '4xl': '2.5rem',  // 40px - Used for large cards
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
// COMMON TAILWIND CLASS COMPOSITIONS
// ============================================================================

export const tw = {
    // Page container
    pageContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    pageContainerWide: 'max-w-[85rem] mx-auto px-4 sm:px-6',
    pageContainerNarrow: 'max-w-4xl mx-auto px-4 sm:px-6',

    // Card styles
    card: 'bg-white rounded-[2rem] border border-slate-200 shadow-sm',
    cardPaper: 'bg-[#fdfbf7] rounded-[2.5rem] border border-slate-200 shadow-xl',
    cardDark: 'bg-slate-900 rounded-[2.5rem] text-white shadow-2xl',
    cardGlass: 'bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100/60 shadow-sm',

    // Text styles
    heading1: 'text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900',
    heading2: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900',
    heading3: 'text-xl md:text-2xl font-bold text-slate-900',
    bodyLarge: 'text-lg text-slate-600 leading-relaxed',
    bodyBase: 'text-base text-slate-600 leading-relaxed',
    bodySmall: 'text-sm text-slate-500 leading-relaxed',
    label: 'text-[11px] font-black text-slate-400 uppercase tracking-widest',

    // Button base styles (use with CSS classes for full effect)
    buttonBase: 'inline-flex items-center justify-center font-semibold transition-all active:scale-95',
    buttonPrimary: 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl shadow-lg',
    buttonSecondary: 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl',
    buttonGhost: 'bg-transparent hover:bg-slate-100 text-slate-600 rounded-xl',
    buttonDanger: 'bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl',

    // Focus states
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:ring-offset-2',

    // Gradients
    gradientPrimary: 'bg-gradient-to-r from-[#0ea5e9] to-indigo-500',
    gradientText: 'text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-indigo-500',
} as const;
