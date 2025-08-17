import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries for better caching
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        },
      },
    },
    // Enable source maps for debugging in production
    sourcemap: false,
    // Optimize for modern browsers
    target: 'es2020',
    // Reduce bundle size
    minify: 'esbuild',
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@supabase/supabase-js'],
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: true,
  },
});
