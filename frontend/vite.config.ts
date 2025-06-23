import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174, // Frontend port
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Django backend URL
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('Origin', 'http://localhost:5174');
            console.log('Sending Request:', req.method, req.url);
          });
        },
      },
      '/sms': {
        target: 'http://127.0.0.1:8000', // Same backend as the `/api` proxy
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/sms/, '/sms'),
      },
      // Proxy for Admin Frontend (runs on port 5173)
      '/admin-api': {
        target: 'http://127.0.0.1:8000', // Assuming the admin also connects to the same backend
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/admin-api/, '/admin-api'),
      },
    },
  },
  build: {
    outDir: 'build',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
