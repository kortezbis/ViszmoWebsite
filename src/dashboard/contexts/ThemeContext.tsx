import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'viszmo-dashboard-theme';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
}

function getStoredTheme(): Theme {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            return stored;
        }
    }
    return 'system';
}

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    /** DOM id of the dashboard wrapper (theme classes apply here only, not on document). */
    dashboardRootId?: string;
}

export function ThemeProvider({ children, defaultTheme = 'system', dashboardRootId = 'viszmo-dashboard-root' }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(() => getStoredTheme() || defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
        const stored = getStoredTheme();
        return stored === 'system' ? getSystemTheme() : stored;
    });

    // Update resolved theme and apply ONLY to the dashboard root wrapper
    useEffect(() => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        setResolvedTheme(resolved);

        // Target ONLY the dashboard root — never document.documentElement
        // This prevents dark mode from leaking to the landing page
        const dashboardRoot = document.getElementById(dashboardRootId);
        if (dashboardRoot) {
            dashboardRoot.classList.remove('light', 'dark');
            dashboardRoot.classList.add(resolved);
        }

        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme, dashboardRootId]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === 'system') {
                const newResolved = getSystemTheme();
                setResolvedTheme(newResolved);

                const dashboardRoot = document.getElementById(dashboardRootId);
                if (dashboardRoot) {
                    dashboardRoot.classList.remove('light', 'dark');
                    dashboardRoot.classList.add(newResolved);
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, dashboardRootId]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'light';
            return resolvedTheme === 'light' ? 'dark' : 'light';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export { ThemeContext };
