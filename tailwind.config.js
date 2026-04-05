/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // IroncladOS design tokens
        base: "#060606",
        surface: "#161616",
        elevated: "#1e1e1e",
        border: "rgba(181, 147, 90, 0.1)",
        "border-bright": "rgba(181, 147, 90, 0.4)",
        muted: "#8a8a8a",
        subtle: "#ababab",
        text: "#efefef",
        "text-bright": "#ffffff",
        // Gold accent system
        accent: "#b5935a",
        "accent-dim": "#96793e",
        "accent-bright": "#d4b277",
        "accent-10": "rgba(181, 147, 90, 0.1)",
        "accent-20": "rgba(181, 147, 90, 0.2)",
        "accent-40": "rgba(181, 147, 90, 0.4)",
        // Status
        success: "#5a9e6f",
        warning: "#d4a94e",
        danger: "#c45454",
      },
      fontFamily: {
        serif: [
          "Cormorant Garamond",
          "Georgia",
          "serif",
        ],
        sans: [
          "DM Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      letterSpacing: {
        "ironclad": "1.4px",
      },
    },
  },
  plugins: [],
};
