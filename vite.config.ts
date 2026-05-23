import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    // Code-split to fix the 500 KB warning
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          radix: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-toast",
          ],
          query: ["@tanstack/react-query"],
          ui: ["lucide-react", "wouter", "date-fns"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true },
    },
  },
});
