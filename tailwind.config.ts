import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Guibay brand palette
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#F0EDF9",
          100: "#D8D0F0",
          200: "#B1A2E0",
          300: "#8A73D1",
          400: "#6344C1",
          500: "#2D1B69",
          600: "#251658",
          700: "#1D1146",
          800: "#150D35",
          900: "#0D0823",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#FFF0F3",
          100: "#FFD6E0",
          200: "#FFADC1",
          300: "#FF84A3",
          400: "#FF5B84",
          500: "#FF1654",
          600: "#E0003A",
          700: "#B8002F",
          800: "#900025",
          900: "#68001A",
        },
        surface: {
          DEFAULT: "#F1F0F7",
          muted: "#F8F8FC",
        },
        text: {
          primary: "#1A1A2E",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": "0.75rem",    // 12px
        xs: "0.875rem",      // 14px
        sm: "1rem",          // 16px
        md: "1.125rem",      // 18px
        lg: "1.5rem",        // 24px
        xl: "2rem",          // 32px
        "2xl": "3rem",       // 48px
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "20px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
        modal: "0 8px 32px rgba(0,0,0,0.16)",
      },
      spacing: {
        "base": "8px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease forwards",
        "slide-in-right": "slide-in-right 300ms ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
