/** @type {import('vite').UserConfig} */
/// <reference types="vitest" />
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'XStateNinja',
      fileName: 'xstate-ninja',
    },
    rollupOptions: {
      external: ['xstate'],
      output: {
        globals: {
          xstate: 'XState',
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
  },
})
