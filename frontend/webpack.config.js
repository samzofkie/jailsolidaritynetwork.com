const path = require('path');

module.exports = { 
  mode: 'development',
  entry: {
    index: {
      import: './index.js',
      dependOn: 'shared'
    },
    shared: 'react'
  },
  devtool: 'inline-source-map',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  optimization: {
    runtimeChunk: 'single'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "babel-loader"
    }]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    port: 9000
  }
};
