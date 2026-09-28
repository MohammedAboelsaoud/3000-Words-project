import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// BASE_PATH lets the GitHub Pages build live under /<repo>/.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  // In development, API calls go to the local Satz server (npm start in server/).
  server: { fs: { allow: ['..'] }, proxy: { '/api': 'http://localhost:8080' } },
});
