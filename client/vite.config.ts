import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // "@": path.resolve(__dirname, "src"),
      '@': path.resolve(__dirname, './src'),
      "@assets": path.resolve(__dirname, "client/src/assets"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@components": path.resolve(__dirname, "client/src/components"),
      "@pages": path.resolve(__dirname, "client/src/pages"),
    },
  },

  server: {
    host: "localhost",
    port: 3000,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 3000,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true,
      },
      "/socket.io": {
        target: "ws://localhost:5000",
        ws: true,
        changeOrigin: true,
      },
    },
  },

  root: path.resolve(__dirname, "."),
  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
  },

  optimizeDeps: {
    exclude: ["@replit/vite-plugin-runtime-error-modal"],
  },
});
