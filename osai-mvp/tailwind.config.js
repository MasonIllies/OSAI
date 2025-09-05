import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        bg: "#07080a",
        fg: "rgba(255,255,255,0.92)",
        muted: "rgba(255,255,255,0.72)",
        border: "rgba(255,255,255,0.14)",
        glass: "rgba(255,255,255,0.08)",
        glassHover: "rgba(255,255,255,0.12)",
        ring: "rgba(255,255,255,0.35)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.35)",
        insetThin: "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      backdropBlur: { xs: "6px" },
      borderRadius: { xl2: "1.25rem", xl3: "1.75rem" },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
