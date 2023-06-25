const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'index.js',
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
  resolve: {
    fallback: {
      fs: false,
      async_hooks: false,
      net: false,
    },
  },
};
