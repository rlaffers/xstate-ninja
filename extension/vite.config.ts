/** @type {import('vite').UserConfig} */
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import pluginWebExtension, { readJsonFile } from 'vite-plugin-web-extension'

const webExtension = pluginWebExtension.default
const manifestFile = process.env.TARGET_BROWSER === 'firefox'
  ? 'src/manifest.firefox.json'
  : 'src/manifest.chrome.json'
const outDir = process.env.TARGET_BROWSER === 'firefox'
  ? 'dist-firefox'
  : 'dist'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src',
  build: {
    outDir: resolve(__dirname, outDir),
    emptyOutDir: true,
  },
  plugins: [
    svelte({
      configFile: '../svelte.config.js',
    }),
    webExtension({
      browser: process.env.TARGET_BROWSER ?? 'chrome',
      manifest: () => {
        const packageJson = readJsonFile('package.json')
        return {
          ...readJsonFile(resolve(__dirname, manifestFile)),
          version: packageJson.version,
        }
      },
      assets: 'assets',
      additionalInputs: [
        'devtools/devtools.html',
        'devtools/devtools.ts',
        'panel/panel.html',
        'panel/panel.ts',
        'inject/content_script.ts',
        'inject/xstate_ninja.ts',
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
