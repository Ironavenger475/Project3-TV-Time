// alter this to compile any node modules to minified js
// currently only compiles d3-cloud
const path = require('path');
module.exports = {
  entry: 'd3-cloud',
  output: {
    filename: 'd3.layout.cloud.min.js',
    path: path.resolve(__dirname, 'js/libraries'),
    library: {
      root: 'd3Cloud',
      amd: 'd3-cloud',
      commonjs: 'd3-cloud'
    },
    libraryTarget: 'umd',
    globalObject: 'window' // Ensure the library is attached to the browser's global object
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      d3: path.resolve(__dirname, 'node_modules/d3/dist/d3.min.js')
    }
  }
};