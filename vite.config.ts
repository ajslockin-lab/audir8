import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [
    react({
      jsx: 'esbuild',
      esbuild: {
        keepNames: false,
        treeShaking: true,
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
