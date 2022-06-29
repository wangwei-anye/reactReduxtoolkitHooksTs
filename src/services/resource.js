import request from '@/utils/request';
import qs from 'qs';
import { API_BASE } from '@/constants';

export function getMapListApi(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/map/searchListWithPage?${querystring}`);
}

export function uploadMap(query) {
  const options = {
    method: 'POST',
    body: query
  };
  return request(`${API_BASE}/map/addWithFile`, options);
}

export function deleteMap(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/map/del`, options);
}
