// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        archive: resolve(__dirname, 'archive.html'),
        about: resolve(__dirname, 'about.html'),
        action: resolve(__dirname, 'action.html'),
				login: resolve(__dirname, 'login.html'),
        upload: resolve(__dirname, 'upload.html'),
      },
    },
  },
  server: {
    proxy: {
      '/categories': 'http://api:8080'
    }
  },
})
