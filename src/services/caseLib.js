import request from '@/utils/request';
import { API_BASE } from '@/constants';

export function getTreeDataApi() {
  if (localStorage.treeData) {
    return JSON.parse(localStorage.treeData);
  }
  return [
    {
      title: '案例教学',
      key: '0',
      isEditable: false
    },
    {
      title: '标准法规',
      key: '1',
      isEditable: true
    }
    // {
    //   title: 'new',
    //   key: '2',
    //   isEditable: false,
    //   children: [
    //     {
    //       title: 'leaf 0-0',
    //       key: '2-0',
    //       isEditable: true
    //     },
    //     {
    //       title: 'leaf 22',
    //       key: '2-1',
    //       isEditable: false
    //     }
    //   ]
    // }
  ];
}
