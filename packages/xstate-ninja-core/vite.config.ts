/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'XStateNinja',
      fileName: 'xstate-ninja',
    },
    rollupOptions: {},
  },
  define: {
    'process.env': {},
  },
})
