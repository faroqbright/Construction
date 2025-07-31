// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false,
    },
    cors: true,
    // origin: "https://appsoapro.techbytech.tech", // ✅ Your production frontend domain
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "appsoapro.techbytech.tech",      // ✅ your current frontend
      "api.appsoapro.techbytech.tech",  // ✅ your API subdomain
      "appsoapro.serveng.ao",           // ✅ old domain preserved
    ],
  },
});
