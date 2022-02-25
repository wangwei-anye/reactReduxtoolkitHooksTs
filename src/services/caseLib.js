import request from '@/utils/request';
import qs from 'qs';
import { API_BASE } from '@/constants';

export function getMenuDataApi() {
  const querystring = qs.stringify({
    id: '1495941982176391170'
  });
  return request(`${API_BASE}/menu/getChildrenMenu?${querystring}`);
}

export function getListApi(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/cases/getListWithPage?${querystring}`);
}

export function createCaseApi(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/cases/add`, options);
}

export function createTaskApi(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/task/create`, options);
}
