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
    compress: true,
    port: 8088,
    hot: true
  },
  devtool: 'source-map'
};
config.plugins.push(new webpack.DefinePlugin(envDefine));

module.exports = config;
