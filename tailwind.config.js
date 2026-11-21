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
        display: ['Space Grotesk', 'Plus Jakarta Sans', '-apple-system', 'sans-serif'],
        editorial: ['Space Grotesk', 'Plus Jakarta Sans', '-apple-system', 'sans-serif'],
        serif: ['Space Grotesk', 'Plus Jakarta Sans', '-apple-system', 'sans-serif'],
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
          950: '#050914',
          900: '#070D19',
          800: '#0E172A',
          700: '#16223A',
        },
        forest: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
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
