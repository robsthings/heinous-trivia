import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: [
      "localhost",
      ".replit.dev",
      "e7e1ab62-01cc-4aba-97d3-1a8f1e8fdf98-00-27ck2q6bfkqpp.worf.replit.dev",
      /.*\.replit\.dev$/
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "..", "shared"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "..", "dist", "public"),
    emptyOutDir: true,
  },
});