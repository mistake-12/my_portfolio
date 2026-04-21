import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#030303",
        surface: "#050505",
        card: "#111111",
        "border-subtle": "rgba(255,255,255,0.05)",
        "border-default": "rgba(255,255,255,0.10)",
        "border-hover": "rgba(255,255,255,0.25)",
      },
      fontFamily: {
        serif: ["Abril Fatface", "Georgia", "serif"],
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
        display: ["Abril Fatface", "Georgia", "serif"],
      },
      letterSpacing: {
        "ultra-wide": "0.3em",
        "widest": "0.2em",
        "wider-plus": "0.15em",
      },
      animation: {
        "fade-up": "fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up-d1": "fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards",
        "fade-up-d2": "fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards",
        "fade-in": "fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        elegant: "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-out-custom": "cubic-bezier(0, 0, 0.2, 1)",
        "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      maxWidth: {
        "6xl": "1152px",
      },
    },
  },
  plugins: [],
};

export default config;
