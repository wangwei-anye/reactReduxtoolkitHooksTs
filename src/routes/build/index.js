import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Card, Tabs, Button, Input, Divider, Progress, Spin, message } from 'antd';
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
  DownOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { STATE_DOING, STATE_COMPLETE } from './constants';
import { selectBuild, getData, clearList } from './slice';

import './index.less';
const { TabPane } = Tabs;
const { Search } = Input;
const antIcon = (
  <LoadingOutlined style={{ marginLeft: '5px', fontSize: 16, color: 'rgba(0,0,0,0.85)' }} spin />
);

const Build = () => {
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tabkey, setTabkey] = useState('1');
  const [current, setCurrent] = useState(1);
  const { loading, listData } = useSelector(selectBuild);

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
            {item.state.alias}
            {item.children && item.testDoneCount < item.sumCount ? (
              <Spin indicator={antIcon} />
            ) : null}
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
                <Progress
                  percent={parseFloat((item.testDoneCount / item.sumCount) * 100).toFixed(2)}
                />
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
                  item.passCount === 0
                    ? 'status-error'
                    : item.passCount === item.sumCount
                    ? 'status-complete'
                    : 'status-part-complete'
                ].join(' ')}
              >
                {item.passCount + '/' + item.sumCount}
              </span>
            ) : (
              <span>
                {item.isPass == 1 ? (
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
              <span>{parseFloat((item.passCount * 100) / item.sumCount).toFixed(2) + '%'}</span>
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
        return <span>{item.state.alias}</span>;
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
                  toPlay(item.playback, item.trafficLightsPlayback, item.mapName);
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
      title: '查看日志',
      key: 'log',
      render: (item) => {
        return (
          <React.Fragment>
            {item.logUrl ? (
              <span
                onClick={() => {
                  toLog(item);
                }}
              >
                <FileTextOutlined style={{ fontSize: 24, cursor: 'pointer' }} />
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
  const toPlay = (playback, trafficLightsPlayback, mapName) => {
    window.open(`/play?fileUrl=${playback}&trafficUrl=${trafficLightsPlayback}&mapName=${mapName}`);
  };

  const toLog = (item) => {
    window.open(`/log?name=${item.name}&url=${item.logUrl}`);
  };

  useEffect(() => {
    query(1);
  }, [tabkey]);

  useEffect(() => {
    let InterId;
    if (tabkey === '1') {
      InterId = setInterval(() => {
        query(current, false);
      }, 10000);
    }
    return () => {
      clearInterval(InterId);
    };
  }, [tabkey]);

  const paginationChangeHandle = (value) => {
    setCurrent(value);
    query(value);
  };

  const refreshHandle = () => {
    setCurrent(1);
    query(1);
  };
  const query = (pageIndex, isClear = true) => {
    //请求前 清空数据  重新渲染  才能默认展开
    if (isClear) {
      dispatch(clearList());
    }
    dispatch(
      getData({
        menuId: '1495942761243193346', //日构建 默认这个ID
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

  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    checkStrictly: false,
    selectedRowKeys,
    onChange: onSelectChange
  };

  if (listData.records.length > 0 && listData.records[0].creator) {
    columns_doing.splice(4, 0, {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator'
    });
    columns_complete.splice(3, 0, {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator'
    });
  }
  return (
    <div className='build-wrap'>
      <Tabs defaultActiveKey={tabkey} onChange={tabChangeHandle}>
        <TabPane tab='正在测试' key='1'>
          <Card className='search-box' bordered={false}>
            <div className='search-box'>
              <div className='tips-box'>
                <div className='box'>
                  <div className='txt'>测试中</div>
                  <div className='num'>{listData.testingCount}</div>
                </div>
                <Divider type='vertical' className='divider' />
                <div className='box'>
                  <div className='txt'>排队中</div>
                  <div className='num'>{listData.pendingCount}</div>
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
                  <Button
                    type='primary'
                    disabled={true}
                    icon={<DeleteOutlined />}
                    size={20}
                  ></Button>
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
                rowSelection={rowSelection}
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
                  <Button
                    type='primary'
                    disabled={true}
                    icon={<DeleteOutlined />}
                    size={20}
                  ></Button>
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
                rowSelection={rowSelection}
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

export default Build;
