import Qs from 'qs';
import axios from 'axios';

axios.defaults.timeout = 20000;

// 自动发送cookie中的认证信息
axios.defaults.withCredentials = true;

axios.defaults.transformRequest = [
  function (data) {
    data = Qs.stringify(data);
    return data;
  }
];

axios.defaults.transformResponse = [
  function (data) {
    data = JSON.parse(data);
    return data;
  }
];

axios.interceptors.request.use(
  function (config) {
    //console.log("请求开始: ", config.url)
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (res) => {
    // 对于任何接口请求行为, API 服务会确认认证信息
    // 当认证信息不存在时, API 服务会返回未认证消息,
    // 对于这种情况, 在此处做统一的拦截处理, 重定向到登录页
    if (res.data.code === '0006') {
      // alert('登录失效, 请重新登录!');
    }

    return res;
  },
  (error) => {
    console.log('请求错误');
    return Promise.reject(error);
  }
);

export default axios;
