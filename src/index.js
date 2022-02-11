import ReactDom from 'react-dom';
import React from 'react';
import RouterConfig from './router';
import './index.less';
import '../mock/score';
import { store } from './models/store';
import { Provider } from 'react-redux';
import 'antd/dist/antd.css';

//@xviz包 需要buffer对象
window.global = window;
global.Buffer = global.Buffer || require('buffer').Buffer;

ReactDom.render(
  <Provider store={store}>{RouterConfig()}</Provider>,
  document.getElementById('root')
);
