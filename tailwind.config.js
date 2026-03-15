/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        stellar: {
          blue: "#0057FF",
          dark: "#0B0E1A",
          card: "#141829",
          border: "#1E2340",
          text: {
            primary: "#FFFFFF",
            secondary: "#8A8FA8",
          },
        },
      },
    },
  },
  plugins: [],
};
