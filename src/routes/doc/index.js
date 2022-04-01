import React, { useState, useEffect } from 'react';
import './index.less';

const Doc = () => {
  return (
    <div className='doc-wrap'>
      <div className='title'>国汽智控云端自动驾驶仿真测试平台版本说明</div>
      <div className='big-version'>V1.0</div>
      <div className='small-version'>v1.0 - 2022.03.04</div>
      <div className='fix-title'>第一版</div>
      <div className='fix-list'>
        <ul>
          <li>搭建公司内网可访问试用的仿真云平台</li>
          <li>支持用户登录</li>
          <li>并发测试运行场景</li>
          <li>场景任务运行状况查看</li>
          <li>自动测评打分</li>
          <li>3d录像回放</li>
          <li>平台可以根据服务器集群的算力自动调配并发测试的数量</li>
        </ul>
      </div>
      <div className='small-version'>v1.1 - 2022.03.31</div>
      <div className='fix-title'>第二版</div>
      <div className='fix-list'>
        <ul>
          <li>场景编辑模块支持添加多障碍车，支持车辆、行人、自行车、动物种类的障碍物</li>
          <li>新增支持导入opensnario格式场景文件测试</li>
          <li>新增地图管理模块，支持小图预览、大图查看</li>
        </ul>
      </div>
    </div>
  );
};

export default Doc;
