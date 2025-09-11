/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // include all your source files
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F7ECD5',
          100: '#E8D4B3',
          200: '#D9BC91',
          300: '#CAA46F',
          400: '#BB8C4D',
          500: '#AC742B', 
          600: '#8A5D22',
          700: '#684619',
          800: '#462F10',
          900: '#241807',
        },
        kenyan: {
          black: '#000000',
          red: '#DE2910', 
          green: '#006600', 
          yellow: '#F7ECD5', 
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      animation: {
        'fly-in': 'fly-in 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fly-in': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
