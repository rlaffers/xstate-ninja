const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.js'),
      name: 'XStateInsights',
      fileName: (format) => `xstate-insights.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['xstate'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        // globals: {
        //   xstate: 'xstate'
        // }
      }
    }
  }
})
