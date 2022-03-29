import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Card, Tabs, Button, Input, Divider, Progress, Spin, Empty } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import LoadingCom from '@/components/LoadingCom';
import {
  ReloadOutlined,
  DeleteOutlined,
  RollbackOutlined,
  CaretRightOutlined,
  StopOutlined,
  PauseCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  RightOutlined,
  DownOutlined
} from '@ant-design/icons';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { STATE_DOING, STATE_COMPLETE, STATE_PASSS, STATE_MAP } from './constants';
import { selectTask, getData, clearList } from './slice';
import './index.less';
const { TabPane } = Tabs;
const { Search } = Input;
const antIcon = (
  <LoadingOutlined style={{ marginLeft: '5px', fontSize: 16, color: 'rgba(0,0,0,0.85)' }} spin />
);

const Task = () => {
  const dispatch = useDispatch();
  const [tabkey, setTabkey] = useState('1');
  const [current, setCurrent] = useState(1);
  const { loading, listData } = useSelector(selectTask);

  const columns_doing = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '测试案例总数',
      key: 'testNum',
      render: (item) => {
        return <span>{item.children ? item.children.length : '1'}</span>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '运行状态',
      key: 'state',
      render: (item) => {
        return (
          <span>
            {STATE_MAP[item.state]}
            {item.children && item.state === STATE_DOING ? <Spin indicator={antIcon} /> : null}
          </span>
        );
      }
    },
    {
      title: '运行进度',
      key: 'state',
      width: '200px',
      render: (item) => {
        return (
          <React.Fragment>
            {item.children ? (
              <span>
                <Progress percent={((item.completeNum + item.errorNum) / item.totalNum) * 100} />
              </span>
            ) : null}
          </React.Fragment>
        );
      }
    },
    {
      title: '算法',
      dataIndex: 'algorithm',
      key: 'algorithm'
    }
  ];

  const columns_complete = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    ,
    {
      title: '通过/总数',
      key: 'createTime',
      render: (item) => {
        return (
          <React.Fragment>
            {item.children ? (
              <span
                className={[
                  'u-status',
                  item.completeNum === 0
                    ? 'status-error'
                    : item.completeNum === item.totalNum
                    ? 'status-complete'
                    : 'status-part-complete'
                ].join(' ')}
              >
                {item.completeNum + '/' + item.totalNum}
              </span>
            ) : (
              <span>
                {item.state == STATE_COMPLETE || item.state == STATE_PASSS ? (
                  <CheckCircleFilled
                    style={{ color: 'rgb(126, 211, 39)', fontSize: 18 }}
                  ></CheckCircleFilled>
                ) : (
                  <CloseCircleFilled style={{ color: '#ff0000', fontSize: 18 }}></CloseCircleFilled>
                )}
              </span>
            )}
          </React.Fragment>
        );
      }
    },
    ,
    {
      title: '通过率',
      key: 'passPer',
      render: (item) => {
        return (
          <React.Fragment>
            {item.children ? (
              <span>{parseFloat((item.completeNum * 100) / item.totalNum).toFixed(2) + '%'}</span>
            ) : null}
          </React.Fragment>
        );
      }
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime'
    },
    {
      title: '状态',
      key: 'state',
      render: (item) => {
        return <span>{STATE_MAP[item.state]}</span>;
      }
    },
    {
      title: '回放',
      key: 'play',
      render: (item) => {
        return (
          <React.Fragment>
            {item.playback ? (
              <span
                onClick={() => {
                  toPlay(item.playback);
                }}
              >
                <PlayCircleOutlined style={{ fontSize: 24, cursor: 'pointer', color: 'green' }} />
              </span>
            ) : null}
          </React.Fragment>
        );
      }
    },
    {
      title: '算法',
      dataIndex: 'algorithm',
      key: 'algorithm'
    }
  ];
  const toPlay = (url) => {
    window.open(`/play?fileUrl=${url}`);
  };

  useEffect(() => {
    query(1);
  }, [tabkey]);

  const paginationChangeHandle = (value) => {
    setCurrent(value);
    query(value);
  };

  const refreshHandle = () => {
    setCurrent(1);
    query(1);
  };
  const query = (pageIndex) => {
    dispatch(clearList());
    dispatch(
      getData({
        current: pageIndex,
        size: DEFAULT_PAGE_SIZE,
        state: tabkey === '1' ? STATE_DOING : STATE_COMPLETE
      })
    );
  };

  const tabChangeHandle = (key) => {
    setCurrent(1);
    setTabkey(key);
  };

  const onSearch = (value) => console.log(value);

  const expandIcon = {
    expandIcon: ({ expanded, onExpand, record }) => {
      if (record.children) {
        return expanded ? (
          <DownOutlined style={{ marginRight: '10px' }} onClick={(e) => onExpand(record, e)} />
        ) : (
          <RightOutlined style={{ marginRight: '10px' }} onClick={(e) => onExpand(record, e)} />
        );
      }
      return null;
    }
  };
  return (
    <div className='task-wrap'>
      <Tabs defaultActiveKey={tabkey} onChange={tabChangeHandle}>
        <TabPane tab='正在测试' key='1'>
          <Card className='search-box' bordered={false}>
            <div className='search-box'>
              <div className='tips-box'>
                <div className='box'>
                  <div className='txt'>测试中</div>
                  <div className='num'>{listData.doingNum}</div>
                </div>
                <Divider type='vertical' className='divider' />
                <div className='box'>
                  <div className='txt'>排队中</div>
                  <div className='num'>{listData.totalQueue}</div>
                </div>
                {/* <Divider type='vertical' className='divider' />
                <div className='box'>
                  <div className='txt'>可提交案例</div>
                  <div className='num'>8</div>
                </div>
                <Divider type='vertical' className='divider' />
                <div className='box'>
                  <div className='txt'>前方等待案例数</div>
                  <div className='num'>9</div>
                </div> */}
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
                  <Button
                    type='primary'
                    onClick={refreshHandle}
                    icon={<ReloadOutlined />}
                    size={20}
                  ></Button>
                  <div>刷新</div>
                </div>
              </div>
              <div className='input-box'>
                <Search onSearch={onSearch} enterButton />
              </div>
            </div>
          </Card>
          <Card bordered={false}>
            {loading ? <LoadingCom /> : null}
            {!loading && listData.records.length > 0 ? (
              <Table
                dataSource={listData.records}
                pagination={{
                  current: current,
                  pageSize: DEFAULT_PAGE_SIZE,
                  position: ['bottomCenter'],
                  total: listData.total,
                  onChange: paginationChangeHandle,
                  showSizeChanger: false
                }}
                defaultExpandAllRows={true}
                indentSize={23}
                expandable={expandIcon}
                rowKey='id'
                columns={columns_doing}
              />
            ) : null}
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
                  <Button
                    type='primary'
                    onClick={refreshHandle}
                    icon={<ReloadOutlined />}
                    size={20}
                  ></Button>
                  <div>刷新</div>
                </div>
              </div>
              <div className='input-box'>
                <Search onSearch={onSearch} enterButton />
              </div>
            </div>
          </Card>
          <Card bordered={false}>
            {loading ? <LoadingCom /> : null}
            {!loading && listData.records.length > 0 ? (
              <Table
                dataSource={listData.records}
                pagination={{
                  current: current,
                  pageSize: DEFAULT_PAGE_SIZE,
                  position: ['bottomCenter'],
                  total: listData.total,
                  onChange: paginationChangeHandle,
                  showSizeChanger: false
                }}
                indentSize={23}
                defaultExpandAllRows={true}
                expandable={expandIcon}
                rowKey='id'
                columns={columns_complete}
              />
            ) : null}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Task;
