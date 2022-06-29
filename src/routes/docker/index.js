import React, { useState, useEffect } from 'react';
import { Button, Input, message } from 'antd';
import { update } from '@/services/docker';

import './index.less';

const Docker = () => {
  const [val, setVal] = useState('');

  const changeValHandle = (e) => {
    setVal(e.target.value);
  };
  const send = async () => {
    if (val === '') {
      message.info('请输入地址');
      return;
    }
    const { data } = await update({
      packageUrl: val
    });
    if (data.code === 200) {
      message.success(data.data);
    }
  };

  return (
    <div className='docker-wrap'>
      <div className='content'>
        <div className='item-list'>
          {/* <div className='item'>
            <Button type='primary' onClick={send}>
              内核镜像更新
            </Button>
          </div>
          <div className='item'>
            <Button type='primary' onClick={send2}>
              icvos_acc桥接模块镜像更新
            </Button>{' '}
          </div> */}
          <div className='item'>
            <div className='input-box'>
              <Input value={val} onChange={changeValHandle}></Input>
            </div>
            <div className='btn-box'>
              <Button type='primary' style={{ display: 'inline-block' }} onClick={send}>
                构建icvos仿真镜像
              </Button>
            </div>
            <div>
              示例：http://172.16.8.114/Integration/icvos2.3.0/x86/ros2/ICVOS_20220525_220440_x86_ros2_2.3.0.27.tar.gz
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docker;
