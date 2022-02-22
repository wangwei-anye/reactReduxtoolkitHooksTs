import request from '@/utils/request';
import { API_BASE } from '@/constants';

export function getMenuDataApi() {
  return request(`http://192.168.113.109:9091/menu/getChildrenMenu?id=1495941982176391170`);
}

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
  ];
}
