/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'
import typescript from 'rollup-plugin-typescript2'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'XStateNinja',
      fileName: 'xstate-ninja',
    },
    rollupOptions: {
      plugins: [
        typescript()
      ]
    }
  }
})
