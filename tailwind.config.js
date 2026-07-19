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
      backgroundImage: {
        'aurora-1':
          'radial-gradient(circle at 20% 30%, var(--accent) 0%, transparent 45%), radial-gradient(circle at 80% 20%, var(--accent-2) 0%, transparent 45%)',
        'hero-glow':
          'radial-gradient(ellipse at center, var(--glow) 0%, transparent 60%)',
      },
      boxShadow: {
        glow: '0 0 40px -8px var(--glow)',
        card: 'var(--shadow)',
      },
      backdropBlur: {
        xs: '4px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'gradient-y': {
          '0%, 100%': { 'background-position': '50% 0%' },
          '50%': { 'background-position': '50% 100%' },
        },
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
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { 'box-shadow': '0 0 20px -10px var(--glow)' },
          '50%': { 'box-shadow': '0 0 45px -6px var(--glow)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -30px)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)', filter: 'hue-rotate(0deg)' },
          '50%': { transform: 'translate(30px,-20px) scale(1.08)', filter: 'hue-rotate(20deg)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 8s ease infinite',
        'gradient-y': 'gradient-y 8s ease infinite',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'fade-up': 'fade-up 0.6s ease forwards',
        'fade-in': 'fade-in 0.6s ease forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite',
        aurora: 'aurora 24s ease-in-out infinite',
        'spin-slow': 'spin-slow 18s linear infinite',
      },
    },
  },
  plugins: [],
}
