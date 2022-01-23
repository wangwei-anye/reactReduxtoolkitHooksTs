import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'antd';
import { getData } from '@/services/login';
import { decrement, increment, incrementByAmount, incrementAsync, selectCount } from './AAASlice';
import { store } from '@/models/store';
import './index.less';

interface ListItem {
  name: string;
}
const AAA: React.FC = (props) => {
  const [count, setCount] = useState<number>(0);
  const [dataList, setDataList] = useState<Array<ListItem>>([]);

  const dispatch = useDispatch();
  const { value } = useSelector(selectCount);

  const { children } = props;

  const handleClick = () => {
    console.log(count);
  };

  const fetchData = async () => {
    const { data } = await getData();
    setDataList(data.data.data);
  };

  useEffect(() => {
    console.log(store.getState());
    console.log(value);
    fetchData();
  }, []);

  const list = (dataList: Array<ListItem>) => {
    return dataList.map((item, index) => {
      return <div key={index}>{item.name}</div>;
    });
  };

  return (
    <div>
      <Button
        className='title'
        onClick={() => {
          setCount((prev) => prev + 1);
          handleClick();
        }}
      >
        count
      </Button>
      {list(dataList)}
      {children}
    </div>
  );
};

export default AAA;
