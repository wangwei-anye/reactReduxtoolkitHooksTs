import request from '@/utils/request';
import qs from 'qs';
import { API_BASE } from '@/constants';

export function getMenuDataApi() {
  const querystring = qs.stringify({
    id: '1495941982176391170'
  });
  return request(`${API_BASE}/menu/getChildrenMenu?${querystring}`);
}

export function createMenuDataApi(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/menu/addWithAuth`, options);
}

export function deleteMenuDataApi(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/menu/del`, options);
}

export function renameMenuDataApi(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/menu/rename`, options);
}

export function getListApi(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/cases/getListWithPage?${querystring}`);
}

export function getAlgorithm() {
  return request(`${API_BASE}/algorithmicLogic/getAllAlgorithmicLogicList`);
}

export function createCaseApi(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/cases/add`, options);
}

export function deleteCaseApi(query) {
  const options = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/cases/del`, options);
}
