import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Table, Rate } from 'antd';
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  selectCount,
  getData
} from './AAASlice';
import { store } from '@/models/store';
import { json } from 'stream/consumers';
import { promises } from 'stream';

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '年龄',
    dataIndex: 'focus',
    key: 'focus'
  }
];

const AAA: React.FC = (props) => {
  const [count, setCount] = useState<number>(0);

  const dispatch = useDispatch();
  const { value, list } = useSelector(selectCount);

  const handleClick = () => {
    console.log(count);
  };

  useEffect(() => {
    dispatch(getData());
  }, []);

  return (
    <div>
      <Button
        className='title'
        onClick={() => {
          setCount((prev) => prev + 1);
          handleClick();
        }}
      >
        count阿1111
      </Button>
      <Rate allowHalf defaultValue={2.5} />
      <Table dataSource={list} columns={columns} />;
    </div>
  );
};

export default AAA;
