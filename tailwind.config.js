/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        stellar: {
          blue: "rgb(var(--stellar-accent) / <alpha-value>)",
          ink: "rgb(var(--stellar-accent-ink) / <alpha-value>)",
          dark: "rgb(var(--stellar-bg) / <alpha-value>)",
          card: "rgb(var(--stellar-card) / <alpha-value>)",
          border: "rgb(var(--stellar-border) / <alpha-value>)",
          text: {
            primary: "rgb(var(--stellar-text-primary) / <alpha-value>)",
            secondary: "rgb(var(--stellar-text-secondary) / <alpha-value>)",
          },
        },
      },
    },
  },
  plugins: [],
};
