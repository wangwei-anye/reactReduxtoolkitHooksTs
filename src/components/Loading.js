/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import { Card, Icon } from 'antd';

const Loading = (props) => (
  <div
    style={{
      height: '100%',
      backgroundColor: '#f0f4f7',
      paddingTop: '5%',
    }}
  >
    <Card
      bordered={false}
      title={
        <span>
          <Icon type="coffee" /> Loading...
        </span>
      }
      style={{ width: '50%', margin: '0 auto' }}
    >
      正在努力為您加載...
    </Card>
  </div>
);

const Error = (props) => (
  <div
    style={{
      height: '100%',
      backgroundColor: '#f0f4f7',
      paddingTop: '5%',
    }}
  >
    <Card
      bordered={false}
      title={
        <span>
          <Icon type="frown" /> 頁面加載失敗
        </span>
      }
      style={{ width: '50%', margin: '0 auto' }}
    >
      Oops，頁面視乎崩潰了！
    </Card>
  </div>
);

export default function MyLoadingComponent({ error, pastDelay }) {
  if (error) {
    return <Error />;
  }
  if (pastDelay) {
    return <Loading />;
  }
  return null;
}
