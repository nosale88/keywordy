import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, options) => {
          options.port = process.env.PORT;
        }
      },
    },
    hmr: true // Simplified HMR config to let Vite handle WebSocket connections
  },
  preview: {
    port: parseInt(process.env.PORT || '3000'),
    strictPort: false
  }
});