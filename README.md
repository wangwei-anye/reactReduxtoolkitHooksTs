## 开发框架

react + redux-toolkit + hooks + typescript

## 项目运行

1、本地开发，启动项目
yarn satrt  
2、发布打包项目 到 dist 文件夹
yarn build:prod
3、开启 node.js 服务
yarn nodejs

## 注意项

1、必须翻墙、然后 yarn 必须降级到 1.10.0 才能安装 streetscape.gl

2、webpack 里需要定义
'process.env.NODE_DEBUG': false
不然 util/util.js 会报错找不到 'process.env.NODE_DEBUG'

3、
npm 安装 buffer
index.js 写入以下代码
window.global = window;
global.Buffer = global.Buffer || require('buffer').Buffer;

不然@xviz/io/dist/esm/common/loaders.js 里的 Buffer 未定义

4、使用 wasm 调用 c++库
webpack 配置
new CopyWebpackPlugin({
patterns: [
{ from: 'public/libjsesmini.wasm', to: 'libjsesmini.wasm' }
]
})

5、地图的容器要设置 position: relative; 地图超出部分才隐藏

6、后端提供的 json 数据需要经过 nodejs 服务解析为 xviz 数据流，才能给 streetscape.gl 使用

7、把 node_modules\@deck.gl\core\dist\esm\lib\layer.js 下的 967、968 两行注释掉
因为 streetscape.gl 播放时，如果把进度条拉到 播放数据 还没加载到的地方，等数据加载到那个地方时候，会从新加载 deck.gl layers
这时候会判断当前 pathLayer 已经存在，就会报错
// assert(!this.internalState && !this.state);
// assert(isFinite(this.props.coordinateSystem));
