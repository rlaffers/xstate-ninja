// const path = require('path')
// const { defineConfig } = require('vite')
// const webExtension = require('vite-plugin-web-extension')
import { resolve } from 'path'
import { defineConfig } from 'vite'
import webExtension from 'vite-plugin-web-extension'

export default defineConfig({
  root: 'src',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    // lib: {
    //   entry: path.resolve(__dirname, 'lib/index.js'),
    //   name: 'XStateNinja',
    //   fileName: (format) => `xstate-ninja.${format}.js`
    // },
    // rollupOptions: {
    //   input: {
    //     devtools: resolve(__dirname, 'devtools/devtools.html'),
    //     panel: resolve(__dirname, 'panel/panel.html'),
    //   },
    // },
    // rollupOptions: {
    //   // make sure to externalize deps that shouldn't be bundled
    //   // into your library
    //   external: ['xstate'],
    //   output: {
    //     // Provide global variables to use in the UMD build
    //     // for externalized deps
    //     // globals: {
    //     //   xstate: 'xstate'
    //     // }
    //   },
    // },
  },
  plugins: [
    webExtension({
      manifest: resolve(__dirname, 'src/manifest.json'),
      assets: 'assets',
      additionalInputs: [
        'devtools/devtools.html',
        'devtools/devtools.js',
        'panel/panel.html',
        'panel/panel.js',
        'inject/page.js',
        'inject/page_wrapper.js',
        'inject/content_script.js',
      ],
      webExtConfig: {
        startUrl: ['http://localhost:4000'],
        browserConsole: true,
        args: ['--auto-open-devtools-for-tabs'],
      },
      verbose: false,
    }),
  ],
})
