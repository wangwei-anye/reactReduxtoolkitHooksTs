import React, { useState, useEffect } from 'react';
import './index.less';

const Test = () => {
  const start = () => {
    // 打开一个WebSocket:
    var ws = new WebSocket('ws://localhost:6555');
    // 响应onmessage事件:
    ws.onmessage = function (msg) {
      console.log(msg.data);
    };
  };
  useEffect(() => {
    start();
  }, []);
  const onSearch = (value) => console.log(value);
  return <div className='task-wrap'>aaaaaaaaaa</div>;
};

export default Test;
