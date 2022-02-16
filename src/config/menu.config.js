import React from 'react';
import { ScheduleOutlined, FolderOpenOutlined } from '@ant-design/icons';
import Loadable from 'react-loadable';
import Loading from '@/components/Loading';
import MapEdit from '@/routes/mapEdit';
import CaseLib from '@/routes/caseLib';

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
    id: 'map-edit',
    title: '地图编辑',
    icon: <ScheduleOutlined />,
    url: '/map-edit',
    component: MapEdit
  }
];
