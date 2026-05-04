import type { Config } from 'tailwindcss';

/**
 * Spotter design tokens.
 *
 * IMPORTANT: This file is a starter — token values will be refined during
 * Phase P0.5 by /impeccable teach. The runtime source of truth lives here
 * and in src/styles/tokens.css. When you update one, update the other.
 *
 * See DESIGN.md at the repo root for the full design system and reasoning.
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          canvas: '#0d0d0f',
          surface: '#161618',
          elevated: '#1c1c1f',
        },
        border: {
          DEFAULT: '#2a2a2e',
          muted: '#1f1f22',
        },
        text: {
          primary: '#f0f0f0',
          muted: '#888888',
          dim: '#555555',
        },
        accent: {
          primary: '#e8ff47',
          secondary: '#ff6b35',
        },
        // AI-generated content indicator color (refine in P0.5)
        ai: {
          DEFAULT: '#a78bfa',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        'body-ar': ['"Cairo"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Mobile-first sizes; @screen md scales up where needed
        'display-lg': [
          '2.5rem',
          { lineHeight: '1.1', letterSpacing: '0.01em' },
        ],
        'display-md': ['2rem', { lineHeight: '1.15', letterSpacing: '0.01em' }],
        h1: ['1.5rem', { lineHeight: '1.2' }],
        h2: ['1.25rem', { lineHeight: '1.25' }],
        'body-lg': ['1rem', { lineHeight: '1.55' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
        'mono-lg': ['1.125rem', { lineHeight: '1.4' }],
        mono: ['0.875rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        pill: '9999px',
      },
      spacing: {
        // Tailwind defaults are 4px-based already; just adding a few extras
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)',
        // BANNED: bounce, elastic, overshoot — see DESIGN.md
      },
      transitionDuration: {
        micro: '150ms',
        standard: '200ms',
        emphasized: '300ms',
        orchestrated: '500ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
