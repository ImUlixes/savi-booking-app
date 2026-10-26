/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          primary: '#ffffff',
          hover: '#f8fafc',
          dark: '#e2e8f0',
          subtle: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.3)'
        },
        dark: {
          base: '#070709',
          surface: '#101015',
          card: 'rgba(20, 20, 28, 0.72)',
          elevated: '#1a1a24'
        }
      },
      fontFamily: {
        heading: ['Jost', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      boxShadow: {
        luxury: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(255, 255, 255, 0.15)',
        gold: '0 0 25px rgba(255, 255, 255, 0.2)'
      }
    },
  },
  plugins: [],
}
