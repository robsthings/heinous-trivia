import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../functions/**/*.{ts,js}',
  ],
  theme: {
    extend: {
      colors: {
        blood: '#8B0000',
        shadow: '#0D0D0D',
        flame: '#FF4500',
        void: '#0B0014',
        dark: '#1a1a1a',
        ghost: '#E0E0E0',
        spirit: '#3F51B5',
        poison: '#228B22',
        crimson: '#DC143C',
      },
      fontFamily: {
        creepster: ['Creepster', 'cursive'],
        nosifer: ['Nosifer', 'cursive'],
        eater: ['Eater', 'cursive'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s infinite',
        'glitch-lines': 'glitch-lines 1.5s infinite',
        'lightning-flash': 'flash 0.3s infinite',
        'shake': 'shake 0.5s infinite',
        'fade-in': 'fadeIn 1.5s ease-out',
        'sprite': 'sprite-animation 1s steps(10) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0px #DC143C' },
          '50%': { boxShadow: '0 0 12px #DC143C' },
        },
        'glitch-lines': {
          '0%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-2px)' },
          '40%': { transform: 'translateX(2px)' },
          '60%': { transform: 'translateX(-2px)' },
          '80%': { transform: 'translateX(2px)' },
          '100%': { transform: 'translateX(0)' },
        },
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'sprite-animation': {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '100% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config