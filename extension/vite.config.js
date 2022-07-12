import { resolve } from 'path'
import { defineConfig } from 'vite'
import webExtension from 'vite-plugin-web-extension'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  root: 'src',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  plugins: [
    svelte(),
    webExtension({
      manifest: resolve(__dirname, 'src/manifest.json'),
      assets: 'assets',
      additionalInputs: [
        'devtools/devtools.html',
        'devtools/devtools.js',
        'panel/panel.html',
        'panel/panel.ts',
        'inject/page.js',
        'inject/page_wrapper.js',
        'inject/content_script.js',
      ],
      webExtConfig: {
        // URL from which the example page is served
        startUrl: ['http://localhost:4000'],
        browserConsole: true,
        args: ['--auto-open-devtools-for-tabs'],
      },
      verbose: false,
    }),
  ],
})
