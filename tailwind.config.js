/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        glass: 'var(--glass)',
        'glass-strong': 'var(--glass-strong)',
        line: 'var(--border)',
        'line-soft': 'var(--border-soft)',
        content: 'var(--text)',
        muted: 'var(--muted)',
        obsidian: 'var(--obsidian)',
        slab: 'var(--slab)',
        gold: 'var(--gold)',
        copper: 'var(--copper)',
        ember: 'var(--ember)',
        rose: 'var(--rose)',
        ink: 'var(--ink)',
        'on-accent': 'var(--on-accent)',
        accent: {
          DEFAULT: 'var(--accent)',
        },
        'accent-2': 'var(--accent-2)',
        'accent-3': 'var(--accent-3)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        display: ['var(--font-display)'],
        logo: ['var(--font-logo)'],
      },
      fontSize: {
        '2xs': '0.6875rem',
        display: 'clamp(2.5rem, 6vw, 4.5rem)',
      },
      lineHeight: {
        ui: '1.2',
        body: '1.6',
        quote: '1.35',
      },
      letterSpacing: {
        logo: '0.18em',
        eyebrow: '0.14em',
      },
      maxWidth: {
        quote: '34ch',
      },
      boxShadow: {
        glow: '0 0 40px -8px var(--glow)',
        card: 'var(--shadow)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-22px) rotate(2deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { 'box-shadow': '0 0 20px -10px var(--glow)' },
          '50%': { 'box-shadow': '0 0 45px -6px var(--glow)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 18s linear infinite',
      },
    },
  },
  plugins: [],
}
