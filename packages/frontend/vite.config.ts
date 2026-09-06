import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Configuração do Vite para o frontend.
 *
 * - React com Fast Refresh
 * - Tailwind CSS v4 via plugin Vite
 * - Proxy para API backend em desenvolvimento
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    watch: {
      ignored: ['**/.wrangler/**', '**/dist/**', '**/.git/**', '**/node_modules/**'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/api-cpf-proxy': {
        target: 'https://apicpf.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-cpf-proxy/, ''),
      },
    },
  },
});
