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
import { selectTask, getData } from './slice';
import './index.less';
const { TabPane } = Tabs;
const { Search } = Input;

const Task = () => {
  const dispatch = useDispatch();
  const { loading, list } = useSelector(selectTask);

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
    window.open('/play?fileUrl=replay/template-236.json');
  };

  useEffect(() => {
    dispatch(getData());
  }, []);
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
                  <Button type='primary' icon={<CaretRightOutlined />} size={20}></Button>
                  <div>开始</div>
                </div>
                <div className='item'>
                  <Button type='primary' icon={<PauseCircleOutlined />} size={20}></Button>
                  <div>暂停</div>
                </div>
                <div className='item'>
                  <Button type='primary' icon={<StopOutlined />} size={20}></Button>
                  <div>停止</div>
                </div>
                <div className='item'>
                  <Button type='primary' icon={<DeleteOutlined />} size={20}></Button>
                  <div>删除</div>
                </div>
                <div className='item'>
                  <Button type='primary' icon={<ReloadOutlined />} size={20}></Button>
                  <div>刷新</div>
                </div>
              </div>
              <div className='input-box'>
                <Search placeholder='input search text' onSearch={onSearch} enterButton />
              </div>
            </div>
          </Card>
          <Card bordered={false}>
            {loading ? (
              <LoadingCom />
            ) : (
              <Table dataSource={list} pagination={{ pageSize: 5 }} columns={columns} />
            )}
          </Card>
        </TabPane>
        <TabPane tab='已完成' key='2'>
          <Card className='search-box' bordered={false}>
            <div className='search-box'>
              <div className='item-list item-list2'>
                <div className='item'>
                  <Button type='primary' icon={<RollbackOutlined />} size={20}></Button>
                  <div>重测</div>
                </div>
                <div className='item'>
                  <Button type='primary' icon={<DeleteOutlined />} size={20}></Button>
                  <div>删除</div>
                </div>
                <div className='item'>
                  <Button type='primary' icon={<ReloadOutlined />} size={20}></Button>
                  <div>刷新</div>
                </div>
              </div>
              <div className='input-box'>
                <Search placeholder='input search text' onSearch={onSearch} enterButton />
              </div>
            </div>
          </Card>
          <Card bordered={false}>
            {loading ? (
              <LoadingCom />
            ) : (
              <Table dataSource={list} pagination={{ pageSize: 5 }} columns={columns} />
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Task;
