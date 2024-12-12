import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/', // This is fine for root-level deployment
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Ensure this correctly maps "@/..." to "./src"
    },
  },
  build: {
    outDir: 'dist', // The default for Vite, ensures build files are output here
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // Main entry point for the app
    },
  },
  server: {
    host: '0.0.0.0', // Required for Render to bind the server
    port: process.env.PORT || 5173, // Use the Render-assigned port or fallback to 3000 locally
  },
});
