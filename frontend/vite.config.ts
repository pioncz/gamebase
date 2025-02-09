import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svgr(), react()],
  base: '',
  server: {
    open: true,
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
