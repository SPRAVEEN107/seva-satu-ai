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
        saffron: "#FF6B00",
        cobalt: "#0047AB",
        "india-green": "#138808",
        "dark-bg": "#0A0A0F",
        "card-bg": "#12121A",
        "card-border": "#1E1E2E",
        muted: "#8888AA",
        "text-primary": "#FFFFFF",
      },
      fontFamily: {
        display: ["Yatra One", "serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "saffron-gradient": "linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)",
        "cobalt-gradient": "linear-gradient(135deg, #0047AB 0%, #0066CC 100%)",
        "hero-mesh":
          "radial-gradient(ellipse at 20% 50%, rgba(255,107,0,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,71,171,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(19,136,8,0.08) 0%, transparent 50%)",
      },
      animation: {
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
        float: "float 3s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      boxShadow: {
        saffron: "0 0 20px rgba(255,107,0,0.3), 0 0 60px rgba(255,107,0,0.1)",
        cobalt: "0 0 20px rgba(0,71,171,0.3), 0 0 60px rgba(0,71,171,0.1)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
