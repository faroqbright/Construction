// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // Add the server configuration object
    hmr: {
      overlay: false, // Disable the HMR error overlay
    },
  },
});