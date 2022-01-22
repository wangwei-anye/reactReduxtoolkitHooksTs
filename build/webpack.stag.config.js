const baseConfig = require('./webpack.base.config');
const optimization = require('./webpack.optimization');

const envName = 'production';
process.env.NODE_ENV = 'production'; // 测试环境保持和生产环境一致的环境变量

const config = {
  ...baseConfig,
  mode: 'production',
};
module.exports = config;
