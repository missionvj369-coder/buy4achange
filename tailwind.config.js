/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
        editorial: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        paper: {
          50: '#FFFFFF',
          100: '#FAF9F6',
          200: '#F2EFE9',
          300: '#E5E1D8',
        },
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          600: '#166534',
          700: '#14532D',
          800: '#0F3D22',
          900: '#0B2B18',
        },
        ink: {
          900: '#14171A',
          700: '#374151',
          500: '#6B7280',
          400: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
}
