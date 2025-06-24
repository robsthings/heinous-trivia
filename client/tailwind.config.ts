import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        blood: '#8A0303',
        correct: '#013220',
        wrong: '#5c0a0a',
        void: '#0b001a',
      },
      fontFamily: {
        creepster: ['"Creepster"', 'cursive'],
      },
    },
  },
  plugins: [],
}

export default config