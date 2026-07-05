/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0a12',
          900: '#0f0f1a',
          850: '#141422',
          800: '#191928',
          700: '#242438',
        },
        accent: {
          400: '#f5b942',
          500: '#f0a83a',
          600: '#d98f28',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
