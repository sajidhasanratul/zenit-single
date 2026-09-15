import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF9F5",   // Premium warm off-white / alabaster base layer
        cardBg: "#FFFFFF",       // Clean solid white panels
        borderSlate: "#1E293B",  // Soft slate-800 charcoal outlines
        accentCyan: "#4F46E5",   // Elegant deep Indigo / Royal accents
        accentGreen: "#059669",  // Sophisticated Emerald Green accents
        textWhite: "#0F172A",    // Deep charcoal text
        textMuted: "#475569",    // Muted slate subtext
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      boxShadow: {
        neoCyan: "4px 4px 0px 0px #4F46E5",
        neoGreen: "4px 4px 0px 0px #059669",
        neoSlate: "4px 4px 0px 0px #1E293B",
        neoWhite: "4px 4px 0px 0px #64748B",
      },
    },
  },
  plugins: [],
};

export default config;
