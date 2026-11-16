/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#070b14',
          navy: '#0d1527',
          surface: '#111b30',
          border: '#1a263e',
          emerald: '#059669',
          forest: '#064e3b',
          lightForest: '#047857',
          gold: '#d97706',
          amber: '#f59e0b',
          champagne: '#fef3c7',
          sand: '#fbfaf7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        cinematic: ['Cinzel', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow': '0 0 45px -5px rgba(5, 150, 105, 0.35)',
        'gold-glow': '0 0 45px -5px rgba(217, 119, 6, 0.35)',
        'cinematic': '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(5, 150, 105, 0.15)',
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
