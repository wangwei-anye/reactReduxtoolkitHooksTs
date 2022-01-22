const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const optimization = (env) => {
  const bool =
    env === 'dadi' || env === 'testing' || env === 'production' ? false : true;
  return {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        // common: {
        //   minSize: 0,
        //   chunks: "all",
        //   // name: "common",
        //   minChunks: 2,
        // },

        // commons: {
        //   test: /[\\/]node_modules[\\/]/,
        //   // cacheGroupKey here is `commons` as the key of the cacheGroup
        //   name(module, chunks, cacheGroupKey) {
        //     const moduleFileName = module.identifier().split('/').reduceRight(item => item);
        //     const allChunksNames = chunks.map((item) => item.name).join('-');
        //     return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
        //   },
        //   chunks: 'all'
        // },
        vendor: {
          priority: -10,
          test: /node_modules/,
          chunks: 'async',
          minSize: 0,
          name: 'vendor',
          minChunks: 1,
          reuseExistingChunk: true,
        },
        'vendor-echarts': {
          test: /echarts\/lib\//,
          chunks: 'all',
          name: 'vendor-echarts',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-react': {
          // test: /react/, // 直接使用 test 来做路径匹配
          test: /[\\/]node_modules[\\/](react|react-dom|react-loadable)[\\/]/,
          chunks: 'all',
          name: 'vendor-react',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-moment': {
          test: /moment/, // 直接使用 test 来做路径匹配
          chunks: 'async',
          name: 'vendor-moment',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-lodash': {
          test: /lodash/, // 直接使用 test 来做路径匹配
          chunks: 'async',
          name: 'vendor-lodash',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-immutable': {
          test: /immutable/, // 直接使用 test 来做路径匹配
          chunks: 'async',
          name: 'vendor-immutable',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-js-export-excel': {
          test: /js-export-excel/, // 直接使用 test 来做路径匹配
          chunks: 'async',
          name: 'vendor-js-export-excel',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-chance': {
          test: /chance/, // 直接使用 test 来做路径匹配
          chunks: 'async',
          name: 'vendor-chance',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-crypto-js': {
          test: /crypto-js/, // 直接使用 test 来做路径匹配
          chunks: 'async',
          name: 'vendor-crypto-js',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-antd': {
          test: /antd/,
          chunks: 'all',
          name: 'vendor-antd',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-react-quill': {
          test: /react-quill/,
          chunks: 'async',
          name: 'vendor-react-quill',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-base64-utf8': {
          test: /base64-utf8/,
          chunks: 'async',
          name: 'vendor-base64-utf8',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-locutus': {
          test: /locutus/,
          chunks: 'async',
          name: 'vendor-locutus',
          enforce: true,
          reuseExistingChunk: true,
        },
        'vendor-react-datasheet': {
          test: /react-datasheet/,
          chunks: 'async',
          name: 'vendor-react-datasheet',
          enforce: true,
          reuseExistingChunk: true,
        },
        styles: {
          name: 'styles',
          test: /\.less$/,
          chunks: 'async',
          enforce: true,
        },
      },
    },

    runtimeChunk: {
      name: 'dist/manifest',
    },

    minimizer: [
      new UglifyJsPlugin({
        cache: bool,
        parallel: bool,
        sourceMap: bool,
        uglifyOptions: {
          compress: {
            drop_console: !bool,
            collapse_vars: !bool,
            reduce_vars: !bool,
          },
          output: {
            beautify: false,
            comments: false,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
          reduceIdents: false,
          autoprefixer: false,
          safe: true,
          discardComments: {
            removeAll: true,
          },
        },
      }),
    ],
  };
};
module.exports = optimization;
