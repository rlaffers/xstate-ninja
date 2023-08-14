/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'XStateNinjaVue',
      fileName: 'xstate-ninja-vue',
    },
    rollupOptions: {
      external: ['@xstate/vue', 'xstate', 'xstate-ninja', 'vue'],
      output: {
        globals: {
          vue: 'Vue',
          xstate: 'XState',
          '@xstate/vue': 'XStateVue',
          'xstate-ninja': 'XStateNinja',
        },
      },
    },
  },
})
