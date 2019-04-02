const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const extractSass = new ExtractTextPlugin('[name].min.css');

module.exports = function() {
  let isProduction = false;
  let cfgName = './config/develop.json';
  const cfg = require(cfgName);

  return {
    entry: {
      engine: './engine/engine.js',
      webapp: './webapp/index.jsx'
    },
    output: {
      filename: '[name].min.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },
    devtool: 'source-map',
    mode: 'development',
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
        {
          test: /\.svg$/,
          use: [
            {
              loader: "babel-loader"
            },
            {
              loader: "react-svg-loader",
              options: {
                jsx: false // true outputs JSX tags
              }
            }
          ]
        },
        {test: /\.html$/, loader: 'html-loader'},
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
      modules: ['games', 'engine', 'webapp', 'node_modules', 'static'],
      extensions: [ '.tsx', '.ts', '.js', '.jsx' ]
    },
    plugins: [
      // new CleanWebpackPlugin(['dist']),
      new webpack.DefinePlugin({
        __CONFIG__: JSON.stringify(cfg)
      }),
      new HtmlWebpackPlugin({
        inject: true,
        chunks: ['engine', 'webapp'],
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
    ],
    devServer: {
      port: 5000,
      host: '0.0.0.0',
      historyApiFallback: true,
    }
  };
}
