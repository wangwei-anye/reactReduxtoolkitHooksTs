import React from 'react';
import { Spin } from 'antd';

export default class LoadingCom extends React.Component {
  render() {
    const defaultStyle = {
      textAlign: 'center',
      margin: '30px'
    };
    const style = Object.assign({}, defaultStyle, this.props.style);
    const tip = this.props.tip || '加载中...';
    return (
      <div style={style}>
        <Spin tip={tip} />
      </div>
    );
  }
}
