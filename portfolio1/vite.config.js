import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // `npm run dev` opens the site in your browser automatically.
  server: { port: 5173, open: true },
  build: {
    // Vercel is configured to serve the `build` directory.
    outDir: 'build',
    target: 'es2020',
    chunkSizeWarningLimit: 1400,
  },
});
