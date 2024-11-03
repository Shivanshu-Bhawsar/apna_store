import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/', // Ensure the base is correct for deployment
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // This should correctly point to your src directory
    },
  },
  build: {
    outDir: 'dist', // Ensure this points to the desired output directory
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // Specify your main HTML file
    },
  },
});
