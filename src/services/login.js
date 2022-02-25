import request from '@/utils/request';
import qs from 'qs';
import { API_BASE } from '@/constants';

export function login(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/user/login`, options);
}
