import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build output — Vercel auto-detects 'dist' for Vite projects
  build: {
    outDir: 'dist',
    sourcemap: false,     // disable sourcemaps in production (no leaking internals)
    // Chunk splitting as a function (required by rolldown in Vite 8)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) return 'react';
            if (id.includes('react-router')) return 'router';
            if (id.includes('framer-motion') || id.includes('/motion/')) return 'motion';
            if (id.includes('@supabase')) return 'supabase';
          }
        },
      },
    },
  },

  // Only variables prefixed with VITE_ are exposed to the browser bundle.
  envPrefix: 'VITE_',
});
