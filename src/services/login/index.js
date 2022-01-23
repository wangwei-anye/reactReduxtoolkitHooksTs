import qs from 'qs';
import request from '@/utils/request';
import { API_BASE } from '@/constants';

export function getData() {
  return request
    .get('/test')
    .then((data) => {
      return { data };
    })
    .catch();
}
