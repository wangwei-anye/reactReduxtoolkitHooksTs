const path = require('path');
const baseConfig = require('./webpack.base.config');
const optimization = require('./webpack.optimization');

const envName = 'development';
process.env.NODE_ENV = 'development';

const config = {
  ...baseConfig,
  mode: 'development',
  // optimization: optimization(envName),
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8000,
    hot: true,
  },
  devtool: 'cheap-module-source-map',
};
module.exports = config;
