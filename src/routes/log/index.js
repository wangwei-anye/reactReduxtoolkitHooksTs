import React, { useState, useEffect } from 'react';
import lodash from 'lodash';
import qs from 'qs';
import { ASSERT_SERVE } from '@/constants';
import './index.less';

const Log = () => {
  const [title, setTitle] = useState('');
  const [logData, setLogData] = useState([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const prarms = qs.parse(lodash.split(window.location.search, '?')[1]);
    setTitle(prarms.name);
    const result = await fetch(ASSERT_SERVE + prarms.url).then((file_data) => {
      if (file_data.status === 200) {
        return file_data.text();
      } else {
        return '该文件不存在';
      }
    });
    const data = result.split('\n');
    setLogData(data);
  };

  return (
    <div className='log-wrap'>
      <div className='title'>任务名称：{title}</div>
      {logData.map((item, index) => {
        return <div key={index}>{item}</div>;
      })}
    </div>
  );
};

export default Log;
