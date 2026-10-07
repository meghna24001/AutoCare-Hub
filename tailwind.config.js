/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    borderRadius: {
      none: '0px',
      sm: '0.5rem',
      DEFAULT: '0.5rem',
      md: '0.5rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1rem',
      full: '9999px',
    },
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
