import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Card, Tabs, Button, Input } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import LoadingCom from '@/components/LoadingCom';
import {
  ReloadOutlined,
  DeleteOutlined,
  RollbackOutlined,
  CaretRightOutlined,
  StopOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import { selectTask, getData } from './slice';
import './index.less';

const { TabPane } = Tabs;
const { Search } = Input;

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
