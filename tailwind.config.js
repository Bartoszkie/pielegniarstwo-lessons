/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        pressed: token('pressed'),
        line: token('line'),
        'line-strong': token('line-strong'),
        ink: token('ink'),
        'ink-2': token('ink-2'),
        'ink-3': token('ink-3'),
        hero: token('hero'),
        'hero-ink': token('hero-ink'),
        note: token('note'),
        'note-ink': token('note-ink'),
        warn: token('warn'),
        'warn-bg': token('warn-bg'),
        'warn-ink': token('warn-ink'),
        'danger-bg': token('danger-bg'),
        'danger-ink': token('danger-ink'),
        accent: token('accent'),
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        raise: 'var(--shadow-raise)',
        'raise-lg': 'var(--shadow-raise-lg)',
        press: 'var(--shadow-press)',
        pop: 'var(--shadow-pop)',
      },
      borderColor: {
        raise: 'var(--raise-line)',
        press: 'var(--press-line)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.34, 1.56, .64, 1)',
        out: 'cubic-bezier(.2, .8, .2, 1)',
      },
      keyframes: {
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(6px) scale(.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'pop-in': 'pop-in .18s cubic-bezier(.2, .8, .2, 1)',
        'fade-in': 'fade-in .15s ease-out',
      },
    },
  },
  plugins: [],
}
