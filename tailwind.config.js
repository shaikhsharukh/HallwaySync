/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#3ECF8E', // Supabase Emerald
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        surface: {
          base: '#0c0e12',
          card: '#14171f',
          raised: '#1b202a',
          hover: '#242b38',
          border: '#2a3242',
          highlight: '#363f52',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)',
        modal: '0 20px 40px -8px rgba(0, 0, 0, 0.7), 0 8px 16px -4px rgba(0, 0, 0, 0.4)',
        emerald: '0 4px 16px -2px rgba(62, 207, 142, 0.25)',
      },
    },
  },
  plugins: [],
};
