const path = require('path');
const {
  hot
} = require('webpack-dev-server/bin/cli-flags');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    static: [{
        directory: path.join(__dirname, 'data'),
        publicPath: '/data',
      },
      {
        directory: path.join(__dirname, 'public'),
        publicPath: '/public',
      },
      {
        directory: path.join(__dirname, 'view'),
        publicPath: '/view',
      },
      {
        directory: path.join(__dirname, 'src'),
        publicPath: '/src',
      },
      {
        directory: path.join(__dirname, 'lib'),
        publicPath: '/lib',
      },
    ],
    hot: true, //热模块替换
    watchFiles: ['src/**/*'], // 添加这一行
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    clean: true,
  },

  resolve: {
    fallback: {
      "path": require.resolve("path-browserify")
    }
  },

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                "targets": "> 0.25%, not dead",
                "useBuiltIns": "usage",
                "corejs": "3.8.3",
              }
            ]
          ]
        }
      }
    }]
  }
};