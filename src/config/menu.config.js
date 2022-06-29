import React from 'react';
import {
  ScheduleOutlined,
  FolderOpenOutlined,
  InteractionOutlined,
  PullRequestOutlined,
  FolderOutlined
} from '@ant-design/icons';
import Loadable from 'react-loadable';
import Loading from '@/components/Loading';

import CaseLib from '@/routes/caseLib';
import Resource from '@/routes/resource';
import Docker from '@/routes/docker';
// const CaseLib = Loadable({
//   loader: () => import('@/routes/caseLib'),
//   loading: Loading,
//   delay: 300
// });
const Task = Loadable({
  loader: () => import('@/routes/task'),
  loading: Loading,
  delay: 300
});

const Build = Loadable({
  loader: () => import('@/routes/build'),
  loading: Loading,
  delay: 300
});

// const MapEdit = Loadable({
//   loader: () => import('@/routes/mapEdit'),
//   loading: Loading,
//   delay: 300
// });

export default [
  {
    id: 'case-lib',
    title: '案例库',
    icon: <FolderOpenOutlined />,
    url: '/case-lib',
    component: CaseLib
  },
  {
    id: 'task',
    title: '任务管理',
    icon: <ScheduleOutlined />,
    url: '/task-list',
    component: Task
  },
  {
    id: 'Resource',
    title: '资源库',
    icon: <FolderOutlined />,
    url: '/resource',
    component: Resource
  },
  {
    id: 'build',
    title: '日构建',
    icon: <PullRequestOutlined />,
    url: '/build-list',
    component: Build
  },
  {
    id: 'docker',
    title: '镜像管理',
    icon: <InteractionOutlined />,
    url: '/docker',
    component: Docker
  }
];
