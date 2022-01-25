import ReactDom from 'react-dom';
import React from 'react';
import RouterConfig from './router';
import './index.less';
import '../mock/score';
import { store } from './models/store';
import { Provider } from 'react-redux';
import 'antd/dist/antd.css';

ReactDom.render(
  <React.StrictMode>
    <Provider store={store}>{RouterConfig()}</Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
