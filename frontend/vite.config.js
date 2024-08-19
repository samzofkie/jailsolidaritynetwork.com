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
				admin: resolve(__dirname, 'admin.html'),
        upload: resolve(__dirname, 'upload.html'),
        login: resolve(__dirname, 'login.html')
      },
    },
  },
  server: {
    proxy: {
      '/auth': 'http://api:8080',
      '/testimonies': 'http://api:8080',
      '/categories': 'http://api:8080',
      '/divisions': 'http://api:8080',
		}, 
  },
});
