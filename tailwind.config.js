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
          50: '#F0F7FF',
          100: '#E0EFFF',
          500: '#0284C7',
          600: '#0369A1',
          700: '#075985',
          800: '#0C4A6E',
          900: '#082F49',
          950: '#041826',
        },
        navy: {
          800: '#151E2E',
          900: '#0B132B',
          950: '#070D1F',
        }
      }
    },
  },
  plugins: [],
}
