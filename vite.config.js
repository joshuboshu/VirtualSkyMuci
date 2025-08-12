import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Asegurar que los archivos de VirtualSky se copien correctamente
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
