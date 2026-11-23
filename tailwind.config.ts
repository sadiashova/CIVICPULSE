import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        civic: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#7cc1fa",
          400: "#36a1f5",
          500: "#0c83eb",
          600: "#0166c8",
          700: "#0252a2",
          800: "#064685",
          900: "#0b3b6f",
          950: "#072549",
        },
      },
    },
  },
  plugins: [],
};
export default config;
