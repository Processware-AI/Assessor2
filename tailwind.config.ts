import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d12",
        panel: "#141821",
        panel2: "#1b2030",
        border: "#262c3a",
        accent: "#4f8cff",
        accent2: "#7c5cff",
        good: "#34d399",
        warn: "#fbbf24",
        bad: "#f87171",
        muted: "#8a94a7",
      },
    },
  },
  plugins: [],
};
export default config;
