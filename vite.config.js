import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external access (e.g., from network or reverse proxy)
    port: 5173, // (optional) default is 5173
    hmr: {
      overlay: false, // Disable error overlay
    },
    cors: true, // Allow CORS in dev server
  },
});
