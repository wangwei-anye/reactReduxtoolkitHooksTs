import request from '@/utils/request';
import qs from 'qs';
import { API_BASE } from '@/constants';

export function saveApi(query) {
  const options = {
    method: 'POST',
    body: query
  };
  return request(`${API_BASE}/cases/addWithFile`, options);
}

export function updateApi(query) {
  const options = {
    method: 'POST',
    body: query
  };
  return request(`${API_BASE}/cases/update`, options);
}
