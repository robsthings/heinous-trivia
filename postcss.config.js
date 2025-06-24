// Root level PostCSS - delegating to client directory
export default {
  plugins: {
    '@tailwindcss/postcss': { config: './client/tailwind.config.ts' },
    autoprefixer: {},
  },
};
