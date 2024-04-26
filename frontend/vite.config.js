// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        archive: resolve(__dirname, 'archive.html'),
        about: resolve(__dirname, 'about.html'),
        action: resolve(__dirname, 'action.html'),
        upload: resolve(__dirname, 'upload.html'),
      },
    },
  },
  server: {
    proxy: {
      '/genders': 'http://api:8080',
      '/divisions': 'http://api:8080',
      '/categories': 'http://api:8080',
      '/testimony': 'http://api:8080',
    },
  },
});
