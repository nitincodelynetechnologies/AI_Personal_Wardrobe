/** @type {import('tailwindcss').Config} */

module.exports = {

  darkMode: 'class',

  content: ['./src/**/*.{js,jsx}'],

  theme: {

    extend: {

      colors: {

        border: 'hsl(var(--border))',

        input: 'hsl(var(--input))',

        ring: 'hsl(var(--ring))',

        background: 'var(--bg-main)',

        foreground: 'var(--text-primary)',

        surface: 'var(--bg-surface)',

        textPrimary: 'var(--text-primary)',

        textMuted: 'var(--text-muted)',

        borderColor: 'var(--border-color)',

        primary: {

          DEFAULT: '#e91e8c',

          foreground: '#ffffff',

        },

        secondary: {

          DEFAULT: 'hsl(var(--secondary))',

          foreground: 'hsl(var(--secondary-foreground))',

        },

        muted: {

          DEFAULT: 'hsl(var(--muted))',

          foreground: 'hsl(var(--muted-foreground))',

        },

        accent: {

          DEFAULT: 'hsl(var(--accent))',

          foreground: 'hsl(var(--accent-foreground))',

        },

        destructive: {

          DEFAULT: 'hsl(var(--destructive))',

          foreground: 'hsl(var(--destructive-foreground))',

        },

        card: {

          DEFAULT: 'var(--bg-surface)',

          foreground: 'var(--text-primary)',

        },

        obsidian: '#07030d',

        'obsidian-elevated': '#1a1028',

        magenta: '#e91e8c',

        violet: '#7c3aed',

      },

      borderRadius: {

        lg: 'var(--radius)',

        md: 'calc(var(--radius) - 2px)',

        sm: 'calc(var(--radius) - 4px)',

      },

      fontFamily: {

        playfair: ['Playfair Display', 'serif'],

        sans: ['DM Sans', 'sans-serif'],

        mono: ['DM Mono', 'monospace'],

        display: ['Playfair Display', 'serif'],

      },

      keyframes: {

        'fade-up': {

          '0%': { opacity: '0', transform: 'translateY(16px)' },

          '100%': { opacity: '1', transform: 'translateY(0)' },

        },

        'magenta-glow': {

          '0%, 100%': { boxShadow: '0 0 20px rgba(233, 30, 140, 0.25)' },

          '50%': { boxShadow: '0 0 40px rgba(233, 30, 140, 0.55)' },

        },

        'pop-in': {

          '0%': { opacity: '0', transform: 'scale(0.92) translateY(24px)' },

          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },

        },

        'try-on-scan': {

          '0%': { top: '0%', opacity: '0' },

          '8%': { opacity: '1' },

          '92%': { opacity: '1' },

          '100%': { top: 'calc(100% - 2px)', opacity: '0' },

        },

        'face-studio-scan': {

          '0%': { top: '0%', opacity: '1' },

          '100%': { top: 'calc(100% - 2px)', opacity: '0.6' },

        },

        'crossfade-in': {

          '0%': { opacity: '0' },

          '100%': { opacity: '1' },

        },

      },

      animation: {

        'fade-up': 'fade-up 0.5s ease-out forwards',

        'magenta-glow': 'magenta-glow 2.5s ease-in-out infinite',

        'pop-in': 'pop-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',

        'try-on-scan': 'try-on-scan 2.5s ease-in-out infinite',

        'face-studio-scan': 'face-studio-scan 2.2s ease-in-out forwards',

        'crossfade-in': 'crossfade-in 1s ease-out forwards',

      },

    },

  },

  plugins: [require('tailwindcss-animate')],

};

