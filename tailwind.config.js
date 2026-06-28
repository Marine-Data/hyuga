/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          blue: '#B8E6F5',
          pink: '#F4C2D8',
          purple: '#E8D4F0',
          yellow: '#FFF5BA',
        }
      }
    },
  },
  plugins: [],
}
