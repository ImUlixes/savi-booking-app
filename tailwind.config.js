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
          primary: '#e2bc70',
          hover: '#efca83',
          dark: '#b8862d',
          subtle: 'rgba(226, 188, 112, 0.12)',
          border: 'rgba(226, 188, 112, 0.28)'
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
        luxury: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(226, 188, 112, 0.15)',
        gold: '0 0 25px rgba(226, 188, 112, 0.25)'
      }
    },
  },
  plugins: [],
}
