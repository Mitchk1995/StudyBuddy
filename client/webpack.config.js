const webpack = require('webpack');

module.exports = {
  // your existing configuration
  resolve: {
    fallback: {
      "url": require.resolve("url/"),
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      "querystring": require.resolve("querystring-es3"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "buffer": require.resolve("buffer/"),
      "zlib": require.resolve("browserify-zlib"),
      "assert": require.resolve("assert/"),
      "util": require.resolve("util/"),
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false,
      "http2": false,
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};