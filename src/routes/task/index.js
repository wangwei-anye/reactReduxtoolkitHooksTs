import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Card, Tabs, Button, Input, Divider } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import LoadingCom from '@/components/LoadingCom';
import {
  ReloadOutlined,
  DeleteOutlined,
  RollbackOutlined,
  CaretRightOutlined,
  StopOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { selectTask, getData } from './slice';
import './index.less';
const { TabPane } = Tabs;
const { Search } = Input;

const Task = () => {
  const dispatch = useDispatch();
  // const [current, setCurrent] = useState(1);
  const { loading, listData } = useSelector(selectTask);

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state'
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
    window.open(
      '/play?fileUrl=replay/multi_intersections.json&mapUrl=download/multi_intersections.xodr'
    );
  };

  useEffect(() => {
    dispatch(
      getData({
        current: 1,
        size: DEFAULT_PAGE_SIZE,
        state: 1
      })
    );
  }, []);

  const paginationChangeHandle = (value) => {
    // setCurrent(value);
    dispatch(
      getData({
        current: value,
        size: DEFAULT_PAGE_SIZE,
        state: 1
      })
    );
  };

  const onSearch = (value) => console.log(value);
  return (
    <div className='task-wrap'>
      <Tabs defaultActiveKey='1'>
        <TabPane tab='正在测试' key='1'>
          <Card className='search-box' bordered={false}>
            <div className='search-box'>
              <div className='tips-box'>
                <div className='box'>
                  <div className='txt'>测试中</div>
                  <div className='num'>9</div>
                </div>
                <Divider type='vertical' className='divider' />
                <div className='box'>
                  <div className='txt'>排队中</div>
                  <div className='num'>9</div>
                </div>
                <Divider type='vertical' className='divider' />
                <div className='box'>
                  <div className='txt'>可提交案例</div>
                  <div className='num'>8</div>
                </div>
                <Divider type='vertical' className='divider' />
                <div className='box'>
                  <div className='txt'>前方等待案例数</div>
                  <div className='num'>9</div>
                </div>
              </div>
              <div className='item-list'>
                <div className='item'>
                  <Button type='primary' disabled icon={<CaretRightOutlined />} size={20}></Button>
                  <div>开始</div>
                </div>
                <div className='item'>
                  <Button type='primary' disabled icon={<PauseCircleOutlined />} size={20}></Button>
                  <div>暂停</div>
                </div>
                <div className='item'>
                  <Button type='primary' disabled icon={<StopOutlined />} size={20}></Button>
                  <div>停止</div>
                </div>
                <div className='item'>
                  <Button type='primary' disabled icon={<DeleteOutlined />} size={20}></Button>
                  <div>删除</div>
                </div>
                <div className='item'>
                  <Button type='primary' disabled icon={<ReloadOutlined />} size={20}></Button>
                  <div>刷新</div>
                </div>
              </div>
              <div className='input-box'>
                <Search onSearch={onSearch} enterButton />
              </div>
            </div>
          </Card>
          <Card bordered={false}>
            {loading ? (
              <LoadingCom />
            ) : (
              <Table
                dataSource={listData.records}
                pagination={{
                  // current: current,
                  pageSize: DEFAULT_PAGE_SIZE,
                  position: ['bottomCenter'],
                  total: listData.total,
                  onChange: paginationChangeHandle
                }}
                columns={columns}
              />
            )}
          </Card>
        </TabPane>
        <TabPane tab='已完成' key='2'>
          <Card className='search-box' bordered={false}>
            <div className='search-box'>
              <div className='item-list item-list2'>
                <div className='item'>
                  <Button type='primary' disabled icon={<RollbackOutlined />} size={20}></Button>
                  <div>重测</div>
                </div>
                <div className='item'>
                  <Button type='primary' disabled icon={<DeleteOutlined />} size={20}></Button>
                  <div>删除</div>
                </div>
                <div className='item'>
                  <Button type='primary' disabled icon={<ReloadOutlined />} size={20}></Button>
                  <div>刷新</div>
                </div>
              </div>
              <div className='input-box'>
                <Search onSearch={onSearch} enterButton />
              </div>
            </div>
          </Card>
          <Card bordered={false}>
            {loading ? (
              <LoadingCom />
            ) : (
              <Table
                dataSource={listData.records}
                pagination={{
                  // current: current,
                  pageSize: DEFAULT_PAGE_SIZE,
                  position: ['bottomCenter'],
                  total: listData.total,
                  onChange: paginationChangeHandle
                }}
                columns={columns}
              />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Task;
