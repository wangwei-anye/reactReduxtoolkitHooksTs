const baseConfig = require('./webpack.base.config');
const optimization = require('./webpack.optimization');
const webpack = require('webpack');
const getEnvDefine = require('./envDefine');

const envName = 'production';
const envDefine = getEnvDefine(envName);
process.env.NODE_ENV = 'production';

const config = {
  ...baseConfig,
  mode: 'production'
};
config.plugins.push(new webpack.DefinePlugin(envDefine));
module.exports = config;
