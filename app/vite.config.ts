import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// BASE_PATH lets the GitHub Pages build live under /<repo>/.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: { fs: { allow: ['..'] } },
});
