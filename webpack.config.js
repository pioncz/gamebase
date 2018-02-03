const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function() {
  let isProduction = false;
  let cfgName = './config/develop.json';
  const cfg = require(cfgName);

  const extractSass = new ExtractTextPlugin({
    filename: "[name].min.css",
    disable: false
  });

  return {
    entry: {
      game: './game/game.js',
      webapp: './webapp/index.jsx'
    },
    output: {
      filename: '[name].min.js',
      path: path.resolve(__dirname, 'dist')
    },
    devtool: isProduction?true:'source-map',
    module: {
      rules: [
        {
          test: /.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['env', 'react', 'stage-1']
          }
        },
        {test: /\.html$/, loader: 'html-loader'},
        { test: /\.js$/, loader: 'imports-loader?THREE=three'},
        { test: /\.sass$/, use: extractSass.extract({
          use: [{
            loader: "css-loader"
          }, {
            loader: "sass-loader",
            options: {
              includePaths: [
                path.resolve(__dirname, 'node_modules'),
                path.resolve(__dirname, 'webapp/styles'),
              ],
              sourceMap: true
            }
          }],
          // use style-loader in development
          fallback: "style-loader"
        }) }
      ]
    },
    resolve: {
      modules: ['game', 'webapp', 'node_modules']
    },
    plugins: [
      new CleanWebpackPlugin(['dist']),
      new webpack.DefinePlugin({
        __CONFIG__: JSON.stringify(cfg)
      }),
      new HtmlWebpackPlugin({
        inject: true,
        chunks: ['game', 'webapp'],
        filename: 'index.html',
        minify: {
          collapseWhitespace: isProduction,
          minifyCSS: isProduction,
          minifyJS: isProduction,
          removeComments: isProduction,
        },
        template: 'webapp/index.html',
      }),
      extractSass,
      new CopyWebpackPlugin([
        { from: 'static', to: 'static' },
      ], {
        copyUnmodified: true
      })
    ],
    devServer: {
      port: 5000,
      host: '0.0.0.0'
    }
  };
}
