import React from 'react';
import {
  ScheduleOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  GroupOutlined
} from '@ant-design/icons';
import Loadable from 'react-loadable';
import Loading from '@/components/Loading';

const Task = Loadable({
  loader: () => import('@/routes/task'),
  loading: Loading,
  delay: 300
});

export default [
  {
    id: 'task',
    title: '任务管理',
    icon: <ScheduleOutlined />,
    subMenu: [
      {
        id: 'task-list',
        title: '任务列表',
        url: '/task-list',
        icon: <FileTextOutlined />,
        component: Task
      }
    ]
  }
];
