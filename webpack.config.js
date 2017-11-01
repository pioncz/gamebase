'use strict';
const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');

module.exports = function(env) {
  if (!env) env = {};

  let isProduction = false;
  let gitInfo = new GitRevisionPlugin({branch: true, versionCommand: 'describe --always --tags'});
  let branch = gitInfo.branch();
  let cfgName = ((branch === 'master' || env.production)?'./config/master.json':'./config/develop.json');
  const cfg = require(cfgName);
  cfg.version = {
    tag: gitInfo.version(),
    branch: branch,
    commit: (gitInfo.commithash()).substr(0,6)
  };
  const extractSass = new ExtractTextPlugin({
    filename: "[name].min.css",
    disable: false
  });

  return {
    entry: {
      engine: './engine/engine.js',
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
      modules: ['engine', 'webapp', 'node_modules']
    },
    plugins: [
      new CleanWebpackPlugin(['dist']),
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
