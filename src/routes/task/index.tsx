import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Card } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import LoadingCom from '@/components/LoadingCom';
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  selectTask,
  getData
} from './slice';
import { useHistory } from 'react-router-dom';

const AAA: React.FC = (props) => {
  console.log(props);
  const [count, setCount] = useState<number>(0);

  const dispatch = useDispatch();
  const { loading, list } = useSelector(selectTask);
  const history = useHistory();

  const handleClick = () => {
    console.log(count);
  };

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
    },
    {
      title: '回放',
      key: 'play',
      render: () => {
        return (
          <span
            onClick={() => {
              toPlay();
            }}
          >
            <PlayCircleOutlined style={{ fontSize: 24, cursor: 'pointer' }} />
          </span>
        );
      }
    }
  ];
  const toPlay = () => {
    window.open('/#/play');
  };

  useEffect(() => {
    dispatch(getData());
  }, []);

  return (
    <div>
      <Card title='任务列表' bordered={false}>
        {loading ? <LoadingCom /> : <Table dataSource={list} columns={columns} />}
      </Card>
    </div>
  );
};

export default AAA;
