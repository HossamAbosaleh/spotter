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
          // Interactive border (hover/focus-within/aria-current).
          // One sanctioned step lighter than `border.DEFAULT`. See DESIGN.md §3.1.
          hover: '#3a3a3e',
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
        // AI-generated content indicator — low-chroma cyan-teal.
        // Replaces the previous lavender (#a78bfa), which violated the
        // "no purple-blue AI gradient slop" anti-reference. See DESIGN.md §3.1.
        ai: {
          indicator: '#90c4d4',
        },
        // Semantic state colors. Always paired with a non-color signal
        // (icon/label/shape). See DESIGN.md §3.1.
        success: '#7bd17a',
        // `warning` is intentionally unified with accent.secondary (#ff6b35)
        // so we do not introduce a fifth hue. Use `accent.secondary` for
        // warning surfaces.
        error: '#e35b4d',
        info: '#7eb6cb',

        // ============================================================
        // shadcn/ui bridge tokens
        // ============================================================
        // shadcn primitives expect token names like `background`,
        // `foreground`, `primary`, `card`, `border`, `ring`, etc.
        // Our project uses Spotter-semantic tokens (bg.canvas,
        // accent.primary, etc.). These bridge entries map shadcn's
        // expected names to Spotter's tokens, so shadcn components
        // automatically use our design system without us editing
        // every primitive.
        //
        // Decisions (locked, but revisitable):
        // - primary  → accent.primary (lime)   — bold default for CTAs
        // - destructive → error (#e35b4d)
        // - ring → accent.primary (focus rings are lime)
        //
        // See DESIGN.md §4 for the rationale.

        background: '#0d0d0f', // = bg.canvas
        foreground: '#f0f0f0', // = text.primary

        card: {
          DEFAULT: '#161618', // = bg.surface
          foreground: '#f0f0f0', // = text.primary
        },

        popover: {
          DEFAULT: '#1c1c1f', // = bg.elevated
          foreground: '#f0f0f0', // = text.primary
        },

        primary: {
          DEFAULT: '#e8ff47', // = accent.primary (lime)
          foreground: '#0d0d0f', // = bg.canvas (dark text on lime)
        },

        secondary: {
          DEFAULT: '#1c1c1f', // = bg.elevated
          foreground: '#f0f0f0', // = text.primary
        },

        muted: {
          DEFAULT: '#161618', // = bg.surface
          foreground: '#888888', // = text.muted
        },

        // Renamed shadcn `accent` to avoid collision with our existing `accent`.
        // shadcn's accent is just hover/highlight; ours is brand color.
        // We don't need shadcn's accent — primitives that use it can be
        // overridden later. If shadcn complains it's missing, uncomment:
        //
        // shadcnAccent: { DEFAULT: '#ff6b35', foreground: '#0d0d0f' },

        destructive: {
          DEFAULT: '#e35b4d', // = error
          foreground: '#0d0d0f', // = bg.canvas (dark text on red — passes AA at 4.7:1; light text fails at 3.5:1)
        },

        input: '#2a2a2e', // = border.DEFAULT
        ring: '#e8ff47', // = accent.primary (focus rings are lime)
        chart: {
          1: '#e8ff47', // accent.primary
          2: '#ff6b35', // accent.secondary
          3: '#7bd17a', // success
          4: '#7eb6cb', // info
          5: '#90c4d4', // ai.indicator
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
        // h1 raised from 24px to 28px so h1/h2 hits the ≥1.25 step ratio.
        // See DESIGN.md §3.2.
        h1: ['1.75rem', { lineHeight: '1.15' }],
        h2: ['1.25rem', { lineHeight: '1.25' }],
        h3: ['1rem', { lineHeight: '1.35' }],
        'body-lg': ['1rem', { lineHeight: '1.55' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
        // Hero data: rest timer, current set weight.
        'mono-xl': ['1.5rem', { lineHeight: '1.2' }],
        'mono-lg': ['1.125rem', { lineHeight: '1.4' }],
        mono: ['0.875rem', { lineHeight: '1.4' }],
        // Badge labels (TS, MB, AI).
        'mono-sm': ['0.75rem', { lineHeight: '1.35', letterSpacing: '0.02em' }],
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
      // Shadow scale. Dark mode prefers borders for elevation; shadow is
      // reserved for true float. See DESIGN.md §3.5.
      boxShadow: {
        subtle: '0 1px 2px 0 rgb(0 0 0 / 0.40)',
        elevated:
          '0 4px 12px -2px rgb(0 0 0 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.04)',
        modal: '0 24px 48px -12px rgb(0 0 0 / 0.70)',
        floating: '0 8px 24px -4px rgb(0 0 0 / 0.60)',
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
