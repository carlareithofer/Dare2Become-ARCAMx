import type { Config } from "tailwindcss";

// Paleta FacturCMR. Încărcată în app/globals.css prin `@config`.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#0F2A4A", dark: "#0B1220" },
        accent: { DEFAULT: "#FF7A1A", pressed: "#E8590C" },
        surface: { DEFAULT: "#F4F6F9", card: "#FFFFFF" },
        ink: { DEFAULT: "#1C2530", muted: "#64748B" },
        status: {
          delivered: "#15803D",
          progress: "#B45309",
          problem: "#DC2626",
          planned: "#64748B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;
