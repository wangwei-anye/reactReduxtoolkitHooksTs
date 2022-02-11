## 开发框架

react + redux-toolkit + hooks + typescript

## 注意项

1、yarn 必须降级到 1.10.0 才能安装 streetscape.gl

2、webpack 里需要定义
'process.env.NODE_DEBUG': false
不然 util/util.js 会报错找不到 'process.env.NODE_DEBUG'

3。
npm 安装 buffer
index.js 写入以下代码
window.global = window;
global.Buffer = global.Buffer || require('buffer').Buffer;

不然@xviz/io/dist/esm/common/loaders.js 里的 Buffer 未定义
