import request from '@/utils/request';
import qs from 'qs';
import { API_BASE } from '@/constants';

export function getListApi(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/task/getListWithPage?${querystring}`);
}

export function createTaskApi(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/task/create`, options);
}

export function deleteTaskApi(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/task/del`, options);
}
