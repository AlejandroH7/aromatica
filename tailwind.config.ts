import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#2a211b",
          soft: "#3a2f27",
          muted: "#6b5f55",
        },
        sand: {
          DEFAULT: "#f1e9dc",
          light: "#f8f3ea",
          dark: "#e2d6c3",
        },
        paper: "#fcf9f3",
        gold: {
          DEFAULT: "#b08d57",
          light: "#d6bb8a",
          dark: "#8a6a38",
        },
        rose: {
          DEFAULT: "#c9a99d",
          soft: "#efe0d9",
        },
        sage: {
          DEFAULT: "#9ba68f",
          soft: "#e4e8dc",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(42, 33, 27, 0.04), 0 8px 24px -12px rgba(42, 33, 27, 0.14)",
        lift: "0 2px 4px rgba(42, 33, 27, 0.05), 0 18px 40px -16px rgba(42, 33, 27, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
