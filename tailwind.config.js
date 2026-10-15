/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    'border-paper-200', 'border-paper-300',
    'bg-paper-50', 'bg-paper-100', 'text-paper-500', 'text-paper-700', 'text-paper-800', 'text-paper-900',
    'hover:bg-paper-50', 'hover:border-paper-300',
    'border-ink-200', 'border-ink-300', 'border-ink-400',
    'bg-ink-50', 'bg-ink-100', 'text-ink-500', 'text-ink-700', 'text-ink-800', 'text-ink-900',
    'bg-rose-50', 'text-rose-600', 'bg-rose-600', 'hover:bg-rose-700',
    'bg-amber-50', 'text-amber-700',
    'bg-sky-50', 'text-sky-700',
    'bg-teal-50', 'text-teal-700',
    'bg-emerald-50', 'text-emerald-700', 'bg-emerald-100',
    'border-brand-200', 'border-brand-300', 'border-brand-500',
    'bg-brand-50', 'bg-brand-100', 'bg-brand-200', 'bg-brand-300', 'bg-brand-500',
    'text-brand-600', 'text-brand-700',
    'hover:text-brand-600', 'hover:text-brand-700', 'hover:border-brand-300',
    'shadow-pop',
  ],
  theme: {
    extend: {
      colors: {
        // Editorial duo-tone: warm paper canvas + deep ink type, one warm
        // ember accent. Avoids the overused "SaaS teal + violet" palette.
        ink: {
          50:  '#F4F2EC',
          100: '#E8E4D9',
          200: '#CFC8B7',
          300: '#A89F88',
          400: '#6B6452',
          500: '#3F3A2E',
          600: '#2A2620',
          700: '#1B1814',
          800: '#13110E',
          900: '#0B0A08',
        },
        paper: {
          50:  '#FBF9F3',
          100: '#F4F0E6',
          200: '#E6DFCC',
          300: '#D2C8AC',
          400: '#B5A989',
        },
        ember: {
          50:  '#FBEEE6',
          100: '#F4D6C2',
          200: '#E9B294',
          300: '#DC8A66',
          400: '#CC6A42',
          500: '#B8502B',
          600: '#9A3F1F',
          700: '#7A311A',
        },
        // Legacy alias — used across dashboards. Points to ember.
        brand: {
          50:  '#FBEEE6',
          100: '#F4D6C2',
          200: '#E9B294',
          300: '#DC8A66',
          400: '#CC6A42',
          500: '#B8502B',
          600: '#9A3F1F',
          700: '#7A311A',
        },
        'accent-violet': '#7A311A',
        success: '#1F7A4D',
        danger:  '#B23A48',
        warn:    '#C58A2E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(11,10,8,.04), 0 1px 2px rgba(11,10,8,.04)',
        pop:  '0 14px 40px -16px rgba(11,10,8,.18), 0 2px 6px rgba(11,10,8,.05)',
        ring: 'inset 0 0 0 1px rgba(11,10,8,.06)',
        'ember-glow': '0 0 0 3px rgba(184,80,43,.18)',
      },
      borderRadius: {
        xl:   '10px',
        '2xl':'14px',
        '3xl':'20px',
        '4xl':'28px',
      },
      transitionTimingFunction: {
        'out-quint':  'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-expo':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quad':'cubic-bezier(0.45, 0, 0.55, 1)',
      },
      backgroundImage: {
        'noise-soft':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        'editorial-grid':
          "linear-gradient(to right, rgba(11,10,8,.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,10,8,.05) 1px, transparent 1px)",
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%':   { opacity: '0', transform: 'translateY(-4px) scale(.98)' },
          '100%': { opacity: '1', transform: 'translateY(0)    scale(1)' },
        },
        'pop-out': {
          '0%':   { opacity: '1', transform: 'translateY(0)    scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-4px) scale(.98)' },
        },
        'item-in': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '.6' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '.25' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: '200px 0' },
        },
      },
      animation: {
        'fade-up':  'fade-up .9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':  'fade-in 1.2s ease both',
        'pop-in':   'pop-in 160ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'pop-out':  'pop-out 140ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'item-in':  'item-in .5s cubic-bezier(0.22, 1, 0.36, 1) both',
        marquee:    'marquee 50s linear infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        blink:      'blink 1.6s ease-in-out infinite',
        shimmer:    'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
