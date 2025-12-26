import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174, // Frontend port
    ...(mode === 'development' && {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000', // Django backend port
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
          target: 'http://127.0.0.1:8001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/sms/, '/sms'),
        },
        '/admin-api': {
          target: 'http://127.0.0.1:8001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/admin-api/, '/admin-api'),
        },
      },
    }),
  },
  // ✅ REMOVE THE HARDCODED DEFINE - Let environment variables work naturally
  build: {
    outDir: 'dist', // Changed from 'build' to 'dist' for Vite
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
