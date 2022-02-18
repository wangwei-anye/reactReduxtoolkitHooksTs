const xviz = require('@xviz/builder');
const buildXvizData = require('./xvizData');
var _ = require('lodash');
var qs = require('qs');

const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

// 创建 websocket 服务器 监听在 3000 端口
const wss = new WebSocketServer({ port: 6555 });
console.log('start node server on port 6555');
// 服务器被客户端连接
wss.on('connection', (ws, req) => {
  let url = req.url;
  let prarms = qs.parse(_.split(url, '?')[1]);
  const data = buildXvizData(prarms.log);
  data.then((result) => {
    for (let i = 0; i < result.length; i++) {
      ws.send(result[i]);
    }
  });
});
