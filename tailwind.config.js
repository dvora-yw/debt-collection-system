/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6", // תחליפי לצבע המדויק מהפיגמה
        secondary: "#10b981",
        background: "#ffffff",
        foreground: "#020817",
        border: "#e2e8f0",
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
      }
    },
  },
  plugins: [],
}