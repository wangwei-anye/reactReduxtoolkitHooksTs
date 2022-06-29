import request from '@/utils/request';
import { API_BASE } from '@/constants';

export function upload(query) {
  const options = {
    method: 'POST',
    body: query
  };
  return request(`${API_BASE}/file/addFile`, options);
}
