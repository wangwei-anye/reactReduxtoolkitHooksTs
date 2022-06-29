import request from '@/utils/request';
import qs from 'qs';
import { API_BASE } from '@/constants';

export function update(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/image-manage/update`, options);
}
