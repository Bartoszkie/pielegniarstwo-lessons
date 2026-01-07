/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          card: '#1a1a25',
          hover: '#22222f',
        },
        accent: {
          primary: '#6366f1',
          secondary: '#818cf8',
          glow: 'rgba(99, 102, 241, 0.15)',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        event: {
          primary: '#10b981',
          secondary: '#f59e0b',
        },
        border: 'rgba(255, 255, 255, 0.06)',
        today: 'rgba(99, 102, 241, 0.12)',
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
      },
    },
  },
  plugins: [],
}
