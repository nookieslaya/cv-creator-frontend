import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        slate: "#64748b",
        surface: "#f8fafc",
        accent: "#0f766e",
        "accent-light": "#ccfbf1",
      },
      fontFamily: {
        sans: ["\"IBM Plex Sans\"", "Segoe UI", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "0 8px 24px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
