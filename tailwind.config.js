// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        primary: "#4A90E2",
        primaryDark: "#2B4B76",
        bgLight: "#F5F5F5"
      }
    }
  },
  plugins: []
}
