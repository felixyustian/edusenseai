/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        primary:   { DEFAULT: "#6C63FF", light: "#8B84FF", dark: "#4B43E0" },
        accent:    { DEFAULT: "#00D4AA", light: "#33DDBB", dark: "#00A886" },
        surface:   { DEFAULT: "#0F1117", card: "#161B27", border: "#1E2535" },
        text:      { DEFAULT: "#E8EAED", muted: "#8B92A5", faint: "#4A5268" },
        danger:    "#FF4D6A",
        warning:   "#FFB800",
        success:   "#00D4AA",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-mesh": "radial-gradient(ellipse at 20% 50%, #6C63FF22 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #00D4AA18 0%, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" },           to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        glow:    { from: { boxShadow: "0 0 5px #6C63FF44" }, to: { boxShadow: "0 0 20px #6C63FF88, 0 0 40px #6C63FF44" } },
      },
      borderRadius: { xl: "1rem", "2xl": "1.5rem", "3xl": "2rem" },
    },
  },
  plugins: [],
};
