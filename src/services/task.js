import request from '@/utils/request';
import qs from 'qs';
import { API_BASE } from '@/constants';

export function getListApi(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/task/getListWithPage?${querystring}`);
}
