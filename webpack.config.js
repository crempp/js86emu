const path = require("path");
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: require.resolve("./src/web.js"),
  output: {
    path: path.resolve(__dirname, "dist/web"),
    filename: "web.bundle.js"
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      }
    ],
    // REQUIRED to avoid issue "Uncaught TypeError: BrowserFS.BFSRequire is not a function"
    // See: https://github.com/jvilk/BrowserFS/issues/201
    // noParse: /browserfs\.js/
  },

  resolve: {
    alias: {
      // 'node_modules': path.join(__dirname, 'node_modules'),
      // Use our versions of Node modules.
      // 'fs': 'browserfs/dist/shims/fs.js',
      // 'buffer': 'browserfs/dist/shims/buffer.js',
      // 'path': 'browserfs/dist/shims/path.js',
      // 'processGlobal': 'browserfs/dist/shims/process.js',
      // 'bufferGlobal': 'browserfs/dist/shims/bufferGlobal.js',
      // 'bfsGlobal': require.resolve('browserfs')
    }
  },
  plugins: [
    // Expose BrowserFS, process, and Buffer globals.
    // NOTE: If you intend to use BrowserFS in a script tag, you do not need
    // to expose a BrowserFS global.
    // new webpack.ProvidePlugin({ BrowserFS: 'bfsGlobal', process: 'processGlobal', Buffer: 'bufferGlobal' }),
    new CopyWebpackPlugin([
      {
        from: 'src/site',
        to: '.'
      },
    ], {}),
  ],
  node: {
    // BrowserFS - disable Webpack's built-in process and Buffer polyfills!
    // process: false,
    // Buffer: false
  },
  watchOptions: {
    aggregateTimeout: 300,
    ignored: /node_modules/
  }
};
