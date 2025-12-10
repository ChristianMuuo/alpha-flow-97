import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        emerald: {
          DEFAULT: "hsl(var(--emerald))",
          dark: "hsl(var(--emerald-dark))",
          glow: "hsl(var(--emerald-glow))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          muted: "hsl(var(--gold-muted))",
        },
        cyan: {
          DEFAULT: "hsl(var(--cyan))",
          glow: "hsl(var(--cyan-glow))",
        },
        profit: "hsl(var(--profit))",
        loss: "hsl(var(--loss))",
        warning: "hsl(var(--warning))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(160 100% 40% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(160 100% 40% / 0.6)" },
        },
        "slide-right": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.8s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards",
        shimmer: "shimmer 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-right": "slide-right 0.5s ease-out",
        typewriter: "typewriter 2s steps(40) forwards",
        blink: "blink 1s step-end infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'emerald-gradient': 'linear-gradient(135deg, hsl(160 100% 40%), hsl(160 80% 25%))',
        'gold-gradient': 'linear-gradient(135deg, hsl(45 100% 50%), hsl(35 100% 40%))',
        'dark-gradient': 'linear-gradient(180deg, hsl(160 30% 3%), hsl(160 30% 2%))',
        'glass-gradient': 'linear-gradient(145deg, hsl(160 25% 8% / 0.9), hsl(160 25% 5% / 0.9))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;