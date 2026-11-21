/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
        editorial: ['Outfit', 'Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
        serif: ['Outfit', 'Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        paper: {
          50: '#FFFFFF',
          100: '#F3F7FB',
          200: '#E8EFF6',
          300: '#D5E1EE',
        },
        obsidian: {
          950: '#05080A',
          900: '#090E12',
          800: '#10171D',
          700: '#18222B',
        },
        forest: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          600: '#10B981',
          700: '#059669',
          800: '#047857',
          900: '#064E3B',
        },
        ink: {
          900: '#0A101F',
          700: '#334155',
          500: '#64748B',
          400: '#94A3B8',
        },
      },
    },
  },
  plugins: [],
}
