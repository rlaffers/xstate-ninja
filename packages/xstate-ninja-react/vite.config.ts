/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'XStateNinjaReact',
      fileName: 'xstate-ninja-react',
    },
    rollupOptions: {
      external: ['@xstate/react', 'xstate', 'xstate-ninja', 'react'],
      output: {
        globals: {
          react: 'React',
          xstate: 'XState',
          '@xstate/react': 'XStateReact',
          'xstate-ninja': 'XStateNinja',
        },
      },
    },
  },
})
