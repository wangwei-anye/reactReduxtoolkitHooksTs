import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Card } from 'antd';
import getDataFromXodr from './lib/getDataFromXodr';

const getData = async () => {
  const result = await getDataFromXodr();
  console.log(result);
};
const MapEdit = () => {
  useEffect(() => {
    getData();
  }, []);

  return <div></div>;
};

export default MapEdit;
