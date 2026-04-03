/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode (originally from dashboard)
  theme: {
    extend: {
      colors: {
        // --- Shared & Dynamic Colors ---
        background: {
          DEFAULT: 'var(--color-background, #ffffff)',
          card: 'var(--color-background-card, #ffffff)',
          'card-alt': 'var(--color-background-card-alt, #fdfbf7)',
          elevated: 'var(--color-background-elevated, #ffffff)',
          glass: 'var(--color-background-glass, rgba(255, 255, 255, 0.8))',
        },
        surface: {
          DEFAULT: 'var(--color-surface, #ffffff)',
          hover: 'var(--color-surface-hover, #f1f5f9)',
          active: 'var(--color-surface-active, #e2e8f0)',
        },
        foreground: {
          DEFAULT: 'var(--color-foreground, #0f172a)',
          secondary: 'var(--color-foreground-secondary, #64748b)',
          muted: 'var(--color-foreground-muted, #94a3b8)',
          inverse: 'var(--color-foreground-inverse, #ffffff)',
        },
        border: {
          DEFAULT: 'var(--color-border, #e2e8f0)',
          light: 'var(--color-border-light, #f1f5f9)',
          strong: 'var(--color-border-strong, #cbd5e1)',
        },
        
        // --- Website Legacy Colors (preserved) ---
        primary: '#6366f1',
        secondary: '#0ea5e9',
        accent: '#f43f5e',
        'glass-border': 'rgba(0, 0, 0, 0.08)',
        'glass-bg': 'rgba(255, 255, 255, 0.8)',
        'glass-highlight': 'rgba(0, 0, 0, 0.05)',
        input: 'var(--color-border, #e2e8f0)',
        ring: 'var(--color-brand-primary, #0ea5e9)',

        // --- Dashboard Specific (brand colors) ---
        brand: {
          primary: 'var(--color-brand-primary, #0ea5e9)',
          'primary-hover': 'var(--color-brand-primary-hover, #0284c7)',
          'primary-light': 'var(--color-brand-primary-light, #e0f2fe)',
          secondary: 'var(--color-brand-secondary, #6366f1)',
          'secondary-hover': 'var(--color-brand-secondary-hover, #4f46e5)',
          accent: 'var(--color-brand-accent, #8b5cf6)',
        },
        
        // Semantic Dash Colors
        success: {
          DEFAULT: 'var(--color-success, #10b981)',
          light: 'var(--color-success-light, #d1fae5)',
        },
        warning: {
          DEFAULT: 'var(--color-warning, #f59e0b)',
          light: 'var(--color-warning-light, #fef3c7)',
        },
        error: {
          DEFAULT: 'var(--color-error, #ef4444)',
          light: 'var(--color-error-light, #fee2e2)',
        },
        info: {
          DEFAULT: 'var(--color-info, #3b82f6)',
          light: 'var(--color-info-light, #dbeafe)',
        },

        // Legacy/Direct dashboard glass object
        glass: {
          border: 'var(--color-glass-border, rgba(0, 0, 0, 0.08))',
          bg: 'var(--color-glass-bg, rgba(255, 255, 255, 0.8))',
          highlight: 'var(--color-glass-highlight, rgba(0, 0, 0, 0.05))',
        },
      },

      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        casual: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'primary': 'var(--shadow-primary)',
        'primary-strong': 'var(--shadow-primary-strong)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a2a2a 0deg, #1a1a1a 50%, #2a2a2a 100%)',
        'gradient-primary': 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
      },

      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px -10px rgba(99, 102, 241, 0)' },
          'to': { boxShadow: '0 0 20px 5px rgba(99, 102, 241, 0.3)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
