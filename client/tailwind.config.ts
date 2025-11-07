import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f5ff",
          100: "#eae9ff",
          200: "#c7c2ff",
          300: "#a59aff",
          400: "#8272ff",
          500: "#604aff",
          600: "#4c3bcc",
          700: "#382c99",
          800: "#251e66",
          900: "#110f33"
        }
      }
    }
  },
  plugins: []
};

export default config;
