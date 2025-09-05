/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        bg: "#07080a",
        border: "rgba(255,255,255,0.14)",
        glass: "rgba(255,255,255,0.08)",
        glassHover: "rgba(255,255,255,0.12)",
        ring: "rgba(255,255,255,0.35)",
      },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,0.35)" },
      backdropBlur: { xs: "6px" },
    },
  },
  plugins: [], // important: keep empty to avoid build error
};
