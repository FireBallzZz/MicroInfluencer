/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    'border-brand-200', 'border-brand-300',
    'bg-brand-200', 'bg-brand-300',
    'text-brand-200', 'text-brand-300',
    'hover:bg-brand-50', 'hover:border-brand-300',
    'hover:bg-brand-200/40', 'hover:bg-brand-200/60',
    'bg-brand-200/40', 'bg-brand-200/60',
    'border-ink-100', 'border-ink-200', 'border-ink-300',
    'bg-ink-50', 'bg-ink-100', 'text-ink-500', 'text-ink-700', 'text-ink-800', 'text-ink-900',
    'bg-rose-50', 'text-rose-600', 'bg-rose-600', 'hover:bg-rose-700',
    'bg-amber-50', 'text-amber-700',
    'bg-sky-50', 'text-sky-700',
    'bg-teal-50', 'text-teal-700',
    'bg-emerald-50', 'text-emerald-700', 'bg-emerald-100',
  ],
  theme: {
    extend: {
      colors: {
        // Upwork-inspired: signature green + supporting neutrals
        brand: {
          50: '#eefbef',
          100: '#d8f5d4',
          200: '#b4eaa9',
          300: '#83d772',
          400: '#4ec147',
          500: '#14a800', // Upwork green
          600: '#108e00', // hover
          700: '#0c6e00',
          800: '#0a5500',
        },
        ink: {
          50: '#f7f8f8',
          100: '#eef0f1',
          200: '#dcdfe2',
          300: '#c0c4c8',
          400: '#9aa0a6',
          500: '#5e6166',
          600: '#3f4145',
          700: '#2a2c2f',
          800: '#1f2123',
          900: '#141618',
        },
        accent: {
          mint:   '#7CE6B5',
          coral:  '#FF7A6C',
          violet: '#8B7CFF',
          amber:  '#FFB23F',
          sky:    '#5BB8FF',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,22,24,.04), 0 1px 1px rgba(20,22,24,.03)',
        pop:  '0 12px 32px -8px rgba(20,22,24,.18), 0 2px 6px rgba(20,22,24,.06)',
        hero: '0 30px 80px -30px rgba(20,106,0,.25)',
        glow: '0 0 0 1px rgba(20,168,0,.12), 0 12px 36px -10px rgba(20,168,0,.35)',
        ring: '0 0 0 6px rgba(20,168,0,.08)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'mesh-pan': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%':      { transform: 'translate3d(2%,-2%,0) scale(1.06)' },
        },
        'marquee': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'shimmer-soft': {
          '0%':   { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: '200px 0' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(.85)', opacity: '.65' },
          '100%': { transform: 'scale(1.6)',  opacity: '0' },
        },
      },
      animation: {
        'fade-up':    'fade-up .8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'mesh-pan':   'mesh-pan 18s ease-in-out infinite',
        'marquee':    'marquee 28s linear infinite',
        'marquee-slow':'marquee 48s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
      },
    },
  },
  plugins: [],
};
