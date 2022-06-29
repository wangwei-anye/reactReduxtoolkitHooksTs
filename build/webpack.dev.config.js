const path = require('path');
const webpack = require('webpack');
const baseConfig = require('./webpack.base.config');
const getEnvDefine = require('./envDefine');
const optimization = require('./webpack.optimization');

const envName = 'development';
const envDefine = getEnvDefine(envName);

const config = {
  ...baseConfig,
  mode: 'development',
  // optimization: optimization(envName),
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    compress: true,
    host: '192.168.112.145',
    port: 8088,
    hot: true
  }
};
config.plugins.push(new webpack.DefinePlugin(envDefine));
config.devtool = 'cheap-module-source-map'; // 慢速，查错时用

module.exports = config;
