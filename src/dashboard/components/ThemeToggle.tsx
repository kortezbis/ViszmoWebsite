import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme } = useTheme();
    const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun;

    return (
        <button
            onClick={toggleTheme}
            className={`w-11 h-11 bg-surface border border-border rounded-xl flex items-center justify-center text-foreground-secondary hover:text-foreground hover:border-brand-primary/30 transition-all group ${className}`}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <ThemeIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
        </button>
    );
}
