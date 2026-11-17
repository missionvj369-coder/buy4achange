/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Syne', 'Space Grotesk', 'sans-serif'],
        cinematic: ['Syne', 'Space Grotesk', 'sans-serif'],
        editorial: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#04030e',
          900: '#060416',
          850: '#0c0824',
          800: '#130e35',
          700: '#1e164d',
        },
        champagne: {
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#ffb800',
          600: '#f59e0b',
        },
        ivory: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },
      },
      boxShadow: {
        luxury: '0 24px 64px -16px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        gold: '0 12px 40px -8px rgba(255, 46, 151, 0.42), 0 0 24px rgba(0, 240, 255, 0.25)',
        neon: '0 0 36px rgba(0, 240, 255, 0.28), 0 0 60px rgba(255, 46, 151, 0.18)',
        cinematic: '0 30px 90px -20px rgba(0, 0, 0, 0.85)',
      },
    },
  },
  plugins: [],
}
