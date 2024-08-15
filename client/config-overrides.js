const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "url": require.resolve("url"),
    "zlib": require.resolve("browserify-zlib"),
    "path": require.resolve("path-browserify"),
    "querystring": require.resolve("querystring-es3"),
    "fs": false,
    "net": false,
    "tls": false,
    "child_process": false,
    "http2": path.resolve(__dirname, 'src/http2Polyfill.js'),
    "process": require.resolve("process/browser"),
    "buffer": require.resolve("buffer")
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  });

  return config;
}