/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'felt-dark': '#1e5128',
        'felt-light': '#2d6a4f',
      },
    },
  },
  plugins: [],
}
