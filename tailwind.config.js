/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        cinematic: ['Cormorant Garamond', 'Georgia', 'serif'],
        editorial: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#040609',
          900: '#05070b',
          850: '#090d14',
          800: '#0e131d',
          700: '#161d2b',
        },
        champagne: {
          200: '#f5e6be',
          300: '#ebd28f',
          400: '#dfc06b',
          500: '#d4af37',
          600: '#b59024',
        },
        ivory: {
          50: '#fcfaf5',
          100: '#f5f1e8',
          200: '#e6dfd0',
          300: '#cfc6b4',
        },
      },
      boxShadow: {
        luxury: '0 24px 64px -16px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        gold: '0 12px 40px -10px rgba(212, 175, 55, 0.28)',
        cinematic: '0 30px 90px -20px rgba(0, 0, 0, 0.85)',
      },
    },
  },
  plugins: [],
}
