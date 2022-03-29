import React, { useState, useEffect } from 'react';
import './index.less';

const Doc = () => {
  return (
    <div className='doc-wrap'>
      <div className='title'>国汽智控云端自动驾驶仿真测试平台版本说明</div>
      <div className='big-version'>V1.0</div>
      <div className='small-version'>v1.1 - 2022.03.02</div>
      <div className='fix-title'>第一版</div>
      <div className='fix-list'>
        <ul>
          <li>案例功能</li>
          <li>任务任务</li>
        </ul>
      </div>
    </div>
  );
};

export default Doc;
