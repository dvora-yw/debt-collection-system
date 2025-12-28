/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use class-based dark mode so the `.dark` class in your CSS toggles Tailwind utilities
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: "var(--color-card)",
        popover: "var(--color-popover)",
        primary: "var(--color-primary)",
        'primary-foreground': "var(--color-primary-foreground)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        sidebar: "var(--color-sidebar)",
        'sidebar-foreground': "var(--color-sidebar-foreground)",
        'sidebar-primary': "var(--color-sidebar-primary)",
        'sidebar-primary-foreground': "var(--color-sidebar-primary-foreground)",
        'sidebar-accent': "var(--color-sidebar-accent)",
        'sidebar-accent-foreground': "var(--color-sidebar-accent-foreground)",
        'sidebar-border': "var(--color-sidebar-border)",
        'sidebar-ring': "var(--color-sidebar-ring)",
        dashboardSoft: "rgb(15 23 42)",
      },
      fontFamily: {
        sans: ['Heebo', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
      }
    },
  },
  plugins: [],
}