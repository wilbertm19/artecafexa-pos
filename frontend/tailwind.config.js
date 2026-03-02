/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdecd3',
          200: '#fad5a5',
          300: '#f7b86d',
          400: '#f39133',
          500: '#f07315',
          600: '#e1570b',
          700: '#ba3f0b',
          800: '#943210',
          900: '#782b10',
        },
      },
    },
  },
  plugins: [],
}
