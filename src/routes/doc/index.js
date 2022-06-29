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
      <div className='small-version'>v1.2 - 2022.04.30</div>
      <div className='fix-title'>第三版</div>
      <div className='fix-list'>
        <ul>
          <li>文件夹形式的场景库管理系统，支持添加、删除、导入、新建等功能</li>
          <li>任务集形式的任务管理系统，支持多选、归类等功能</li>
          <li>新增支持查看、预览YAML场景</li>
          <li>接入icvos2.0</li>
          <li>新增chrono动力学模块</li>
          <li>web端任务状态自动实时同步刷新</li>
        </ul>
      </div>
      <div className='small-version'>v1.3 - 2022.05.30</div>
      <div className='fix-title'>第四版</div>
      <div className='fix-list'>
        <ul>
          <li>新增支持创建交通流信号灯案例</li>
          <li>新增支持查看、预览opensnario场景文件</li>
          <li>支持多用户角色登录、管理模块</li>
        </ul>
      </div>
      <div className='small-version'>v1.4 - 2022.06.30</div>
      <div className='fix-title'>第五版</div>
      <div className='fix-list'>
        <ul>
          <li>添加快速测试集系统</li>
          <li>新增地图模块，支持上传opendrive格式地图</li>
          <li>新增yaml文件导入功能</li>
          <li>新增日构建功能</li>
          <li>新增镜像管理功能</li>
          <li>地图车道增加方向箭头</li>
        </ul>
      </div>
    </div>
  );
};

export default Doc;
