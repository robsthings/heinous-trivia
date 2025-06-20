import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../client/src/**/*.{js,jsx,ts,tsx}",
    "./client/src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
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
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
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
        // Horror theme colors
        blood: "hsl(0 84% 27%)", /* #8B0000 */
        shadow: "hsl(248 39% 27%)", /* #2D1B69 */
        flame: "hsl(14 100% 59%)", /* #FF6B35 */
        void: "hsl(0 0% 4%)", /* #0A0A0A */
        dark: "hsl(0 0% 10%)", /* #1A1A1A */
        ghost: "hsl(0 0% 87%)", /* #E0E0E0 */
        spirit: "hsl(0 0% 100%)", /* #FFFFFF */
        poison: "hsl(120 100% 27%)", /* #228B22 */
        crimson: "hsl(348 83% 47%)", /* #DC143C */
      },
      fontFamily: {
        creepster: ['Creepster', 'cursive'],
        nosifer: ['Nosifer', 'cursive'],
        eater: ['Eater', 'cursive'],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--blood) / 0.5)"
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--blood) / 0.8)"
          }
        },
        "shake": {
          "0%, 100%": {
            transform: "translateX(0)"
          },
          "25%": {
            transform: "translateX(-5px)"
          },
          "75%": {
            transform: "translateX(5px)"
          }
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "slide-up": {
          "0%": {
            transform: "translateY(100%)"
          },
          "100%": {
            transform: "translateY(0)"
          }
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.8) rotateY(15deg)"
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05) rotateY(0deg)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) rotateY(0deg)"
          }
        },
        "lightning-flash": {
          "0%, 90%, 100%": { 
            opacity: "0",
            background: "radial-gradient(ellipse at center, rgba(30, 144, 255, 0) 0%, rgba(30, 144, 255, 0) 100%)"
          },
          "2%": { 
            opacity: "0.8",
            background: "radial-gradient(ellipse at center, rgba(30, 144, 255, 0.4) 0%, rgba(30, 144, 255, 0.1) 60%, transparent 100%)"
          },
          "4%": { 
            opacity: "0.3",
            background: "radial-gradient(ellipse at center, rgba(30, 144, 255, 0.2) 0%, rgba(30, 144, 255, 0.05) 60%, transparent 100%)"
          },
          "6%": { 
            opacity: "1",
            background: "radial-gradient(ellipse at center, rgba(30, 144, 255, 0.6) 0%, rgba(30, 144, 255, 0.2) 60%, transparent 100%)"
          },
          "8%": { 
            opacity: "0.1",
            background: "radial-gradient(ellipse at center, rgba(30, 144, 255, 0.1) 0%, rgba(30, 144, 255, 0.02) 60%, transparent 100%)"
          }
        },
        "glitch-lines": {
          "0%": { 
            transform: "translateX(0) skewX(0deg)",
            opacity: "0.7"
          },
          "10%": { 
            transform: "translateX(-3px) skewX(-2deg)",
            opacity: "0.9"
          },
          "15%": { 
            transform: "translateX(2px) skewX(1deg)",
            opacity: "0.5"
          },
          "25%": { 
            transform: "translateX(-1px) skewX(-1deg)",
            opacity: "0.8"
          },
          "35%": { 
            transform: "translateX(4px) skewX(2deg)",
            opacity: "0.6"
          },
          "50%": { 
            transform: "translateX(0) skewX(0deg)",
            opacity: "0.7"
          },
          "65%": { 
            transform: "translateX(-2px) skewX(-3deg)",
            opacity: "0.9"
          },
          "75%": { 
            transform: "translateX(3px) skewX(1deg)",
            opacity: "0.4"
          },
          "85%": { 
            transform: "translateX(-4px) skewX(-2deg)",
            opacity: "0.8"
          },
          "95%": { 
            transform: "translateX(2px) skewX(2deg)",
            opacity: "0.6"
          },
          "100%": { 
            transform: "translateX(0) skewX(0deg)",
            opacity: "0.7"
          }
        },
        "sprite-slide-bounce-in": {
          "0%": {
            opacity: "0",
            transform: "translateX(-100vw) scale(0.8)"
          },
          "60%": {
            opacity: "1",
            transform: "translateX(10px) scale(1.1)"
          },
          "80%": {
            transform: "translateX(-5px) scale(0.95)"
          },
          "90%": {
            transform: "translateX(2px) scale(1.02)"
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) scale(1)"
          }
        },
        "sprite-glitch-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.8) rotate(-2deg)",
            filter: "brightness(0.5) contrast(1.5)"
          },
          "10%": {
            opacity: "0.3",
            transform: "scale(1.1) rotate(1deg)",
            filter: "brightness(1.8) contrast(2) hue-rotate(30deg)"
          },
          "15%": {
            opacity: "0",
            transform: "scale(0.9) rotate(-1deg)",
            filter: "brightness(0.3) contrast(3)"
          },
          "25%": {
            opacity: "0.7",
            transform: "scale(1.05) rotate(0.5deg)",
            filter: "brightness(1.3) contrast(1.8) hue-rotate(-15deg)"
          },
          "30%": {
            opacity: "0.1",
            transform: "scale(0.95) rotate(-0.5deg)",
            filter: "brightness(0.7) contrast(2.5)"
          },
          "40%": {
            opacity: "0.9",
            transform: "scale(1.02) rotate(0deg)",
            filter: "brightness(1.1) contrast(1.3) hue-rotate(10deg)"
          },
          "50%": {
            opacity: "0.2",
            transform: "scale(0.98) rotate(0.3deg)",
            filter: "brightness(0.4) contrast(2)"
          },
          "70%": {
            opacity: "0.8",
            transform: "scale(1.01) rotate(-0.1deg)",
            filter: "brightness(1.05) contrast(1.1)"
          },
          "85%": {
            opacity: "0.4",
            transform: "scale(0.99) rotate(0deg)",
            filter: "brightness(0.8) contrast(1.5)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) rotate(0deg)",
            filter: "brightness(1) contrast(1) hue-rotate(0deg)"
          }
        },
        "sprite-idle-twitch": {
          "0%, 100%": {
            transform: "scale(1) rotate(0deg)"
          },
          "25%": {
            transform: "scale(1.02) rotate(0.5deg)"
          },
          "50%": {
            transform: "scale(0.98) rotate(-0.3deg)"
          },
          "75%": {
            transform: "scale(1.01) rotate(0.2deg)"
          }
        },
        "speech-bubble-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px) scale(0.9)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shake": "shake 0.5s ease-in-out",
        "fade-in": "fade-in 0.5s ease-in",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.6s ease-out",
        "lightning-flash": "lightning-flash 2s infinite",
        "glitch-lines": "glitch-lines 1.5s infinite",
        "sprite-slide-bounce-in": "sprite-slide-bounce-in 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        "sprite-glitch-in": "sprite-glitch-in 2s ease-out forwards",
        "sprite-idle-twitch": "sprite-idle-twitch 4s ease-in-out infinite",
        "speech-bubble-in": "speech-bubble-in 0.8s ease-out forwards"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;