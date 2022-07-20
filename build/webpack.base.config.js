const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  entry: {
    index: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: 'index-[hash:8].js',
    chunkFilename: 'js/[name].chunk-[chunkhash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx|\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // 指定特定的ts编译配置，为了区分脚本的ts配置
              configFile: path.resolve(__dirname, '../tsconfig.json')
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /(?:\.js|\.jsx|\.es6)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        include: [path.join(process.cwd(), './src')],
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader']
      },
      //编译加载图片及字体
      {
        test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5000,
              outputPath: 'images'
            }
          }
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  resolve: {
    //别名
    alias: {
      componets: './src/components/',
      '@': path.resolve(__dirname, '../src')
    },
    //引入文件没有后缀时，默认后缀
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      favicon: path.resolve('favicon.ico')
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[contenthash:8].css',
      chunkFilename: 'css/[id]-[contenthash:8].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/libjsesmini.wasm', to: 'libjsesmini.wasm' },
        { from: 'public/libjsesmini.wasm', to: 'js/libjsesmini.wasm' },
        { from: 'public/libtrajectory.wasm', to: 'libtrajectory.wasm' },
        { from: 'public/libtrajectory.wasm', to: 'js/libtrajectory.wasm' },

        //解析xosc文件的c++ lib 需要下面2个文件
        {
          from: 'public/VehicleCatalog.xosc',
          to: 'xosc/Catalogs/Vehicles/VehicleCatalog.xosc'
        },
        {
          from: 'public/ControllerCatalog.xosc',
          to: 'xosc/Catalogs/Controllers/ControllerCatalog.xosc'
        }
      ]
    })
  ]
};
module.exports = config;
