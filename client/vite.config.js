import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // Base path for your application; keep it '/' for root deployment
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Allows you to use '@' as an alias for the 'src' directory
    },
  },
  build: {
    outDir: "dist", // Specify the output directory for the build
  },
});
