module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        creepster: ['"Creepster"', 'cursive'],
        nosifer: ['"Nosifer"', 'cursive'],
        eater: ['"Eater"', 'cursive'],
      },
      colors: {
        blood: '#7f0000',
        shadow: '#1a1a1a',
        flame: '#ff5500',
        void: '#0b001a',
        dark: '#0d0d0d',
        ghost: '#f2f2f2',
        spirit: '#bb86fc',
        poison: '#013220',
        crimson: '#5c0a0a',
        correct: '#013220',
        wrong: '#5c0a0a',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'shake': 'shake 0.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'lightning-flash': 'lightning-flash 0.1s ease-in-out',
        'glitch-lines': 'glitch-lines 0.3s ease-in-out',
        'sprite-glitch-in': 'sprite-glitch-in 1s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { 
            boxShadow: '0 0 5px rgba(138, 3, 3, 0.5)',
            transform: 'scale(1)',
          },
          '100%': { 
            boxShadow: '0 0 20px rgba(138, 3, 3, 0.8), 0 0 30px rgba(138, 3, 3, 0.4)',
            transform: 'scale(1.02)',
          },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'lightning-flash': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(135, 206, 250, 0.3)' },
        },
        'glitch-lines': {
          '0%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-2px)' },
          '40%': { transform: 'translateX(2px)' },
          '60%': { transform: 'translateX(-1px)' },
          '80%': { transform: 'translateX(1px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'sprite-glitch-in': {
          '0%': { 
            opacity: '0',
            filter: 'brightness(0) contrast(200%)',
            transform: 'scale(0.8)',
          },
          '50%': { 
            opacity: '0.7',
            filter: 'brightness(150%) contrast(150%)',
            transform: 'scale(1.1)',
          },
          '100%': { 
            opacity: '1',
            filter: 'brightness(100%) contrast(100%)',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
}