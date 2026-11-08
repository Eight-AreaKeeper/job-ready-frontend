import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server forwards /api to the Spring Boot back end, so the browser never needs CORS.
// Change the target with VITE_API_TARGET (default http://localhost:8000).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_TARGET || 'http://localhost:8000';
  return {
    plugins: [react()],
    server: { port: 5173, proxy: { '/api': { target, changeOrigin: true } } },
    preview: { port: 4173, proxy: { '/api': { target, changeOrigin: true } } },
  };
});
