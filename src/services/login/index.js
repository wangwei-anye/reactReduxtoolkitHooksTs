import qs from 'qs';
import request from '@/utils/request';
import { API_BASE } from '@/constants';

export function getDataApi() {
  return request(
    'https://pcw-api.iqiyi.com/search/recommend/list?channel_id=1&data_type=1&mode=11&page_id=2&ret_num=48&session=dabd987334c53f9ab5f224e38c708889'
  );
}

export function approveFinancePassOrRejectRequstApi(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(``, option);
}
