/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tedx: {
          red: "#EB0028", // TEDx red
          white: "#F5F5F5",
          black: "#0A0A0A",
          blackLight: "#1A1A1A",
          blackMid: "#121212",
          blackDark: "#050505",
        },
      },
      fontFamily: {
        tedx: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
}
