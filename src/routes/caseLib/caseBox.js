import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Select, Modal, message } from 'antd';
import {
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  ExportOutlined,
  PlusOutlined,
  RedoOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import {} from './slice';
import { createTaskApi, createCaseApi } from '@/services/caseLib';
import { DEFAULT_PAGE_SIZE } from '@/constants';

import './index.less';
const { Option } = Select;
const columns = [
  {
    title: 'ID',
    dataIndex: 'id'
  },
  {
    title: 'Name',
    dataIndex: 'name'
  }
];

const caseBox = (props) => {
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isCaseModalVisible, setIsCaseModalVisible] = useState(false);
  const [algorithm, setAlgorithme] = useState();
  const [caseName, setCaseName] = useState();
  const [taskName, setTaskName] = useState();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  function handleChange(value) {
    console.log(`selected ${value}`);
  }

  const onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const run = () => {
    setTaskName('task_' + new Date().toLocaleString());
    setIsTaskModalVisible(true);
  };
  //任务
  const modalTaskHandleOk = async () => {
    const selectKeys = [];
    for (let i = 0; i < selectedRowKeys.length; i++) {
      if (props.listData.records[selectedRowKeys[i]]) {
        selectKeys.push(props.listData.records[selectedRowKeys[i]].id);
      }
    }
    if (!taskName) {
      message.info('请输入任务名称');
      return;
    }
    if (!algorithm) {
      message.info('请选择算法');
      return;
    }
    if (selectKeys.length === 0) {
      message.info('请选择案例');
      return;
    }
    const { data } = await createTaskApi({
      algorithm: algorithm,
      name: taskName,
      caseId: '1496027742552342529,1496027649921138690' //selectKeys.join(',')
    });
    if (data.code === 200) {
      message.success('创建成功!');
      setIsTaskModalVisible(false);
    }
  };

  const modalTaskHandleCancel = () => {
    setIsTaskModalVisible(false);
  };
  const algorithmChangeHandle = (value) => {
    setAlgorithme(value);
  };
  const taskNameChangeHandle = (e) => {
    setTaskName(e.target.value);
  };
  //案例

  const addCase = () => {
    setIsCaseModalVisible(true);
  };

  const modalCaseHandleOk = async () => {
    if (!caseName) {
      message.info('请输入案例名称');
      return;
    }
    const { data } = await createCaseApi({
      menuId: props.menuId[0],
      name: caseName
    });
    if (data.code === 200) {
      message.success('创建成功!');
      setCaseName('');
      setIsCaseModalVisible(false);
    }
  };

  const modalCaseHandleCancel = () => {
    setIsCaseModalVisible(false);
  };

  const caseNameChangeHandle = (e) => {
    setCaseName(e.target.value);
  };
  const paginationChangeHandle = (value) => {
    props.pageIndexChange(value);
  };

  return (
    <div className='case-box-wrap'>
      <div className='menu-box'>
        <div className='item-btn'>
          <Button type='primary' onClick={addCase} icon={<PlusOutlined />}>
            新建案例
          </Button>
        </div>
        <div className='item-list'>
          <div className='item'>
            <Button type='primary' icon={<DownloadOutlined />} size={20}></Button>
            <div>导入</div>
          </div>
          <div className='item'>
            <Button type='primary' icon={<ExportOutlined />} size={20}></Button>
            <div>导出</div>
          </div>
          <div className='item'>
            <Button type='primary' icon={<EditOutlined />} size={20}></Button>
            <div>编辑</div>
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
      </div>
      <div className='search-box'>
        {/* <div className='select-box'>
          <span>文件夹:</span>
          <Select
            mode='multiple'
            allowClear
            style={{ width: '100%' }}
            placeholder='Please select'
            defaultValue={['a10', 'c12']}
            onChange={handleChange}
          >
            {children}
          </Select>
        </div>
        <div className='select-box'>
          <span>案例类型:</span>
          <Select
            mode='multiple'
            allowClear
            style={{ width: '100%' }}
            placeholder='Please select'
            defaultValue={['a10', 'c12']}
            onChange={handleChange}
          >
            {children}
          </Select>
        </div> */}
        {/* <div className='select-box reset-btn'>
          <Button type='primary' icon={<RedoOutlined />} size={20}></Button>
          <div>重置</div>
        </div> */}
        <div className='select-box run-btn'>
          <span>已选案例数：{selectedRowKeys.length}</span>
          <Button type='primary' size={20} onClick={run}>
            运行
          </Button>
        </div>
      </div>
      <div className='list-box'>
        <Table
          rowSelection={rowSelection}
          pagination={{
            pageSize: DEFAULT_PAGE_SIZE,
            position: ['bottomCenter'],
            total: props.listData.total,
            onChange: paginationChangeHandle
          }}
          columns={columns}
          dataSource={props.listData.records}
        />
      </div>
      <Modal
        title='创建任务'
        className='create-task-modal'
        visible={isTaskModalVisible}
        onOk={modalTaskHandleOk}
        onCancel={modalTaskHandleCancel}
        okText='确认'
        cancelText='取消'
      >
        <div className='create-task-list'>
          <div className='create-task-item'>
            任务名称：
            <input value={taskName || ''} onChange={taskNameChangeHandle} className='input'></input>
          </div>
          <div className='create-task-item'>
            算法类型：
            <Select defaultValue='请选择' onChange={algorithmChangeHandle} className='select'>
              <Option value='1'>算法1</Option>
              <Option value='12'>算法2</Option>
            </Select>
          </div>
          <div className='create-task-item'>案例总数：{selectedRowKeys.length}</div>
        </div>
      </Modal>
      <Modal
        title='创建案例'
        className='create-task-modal'
        visible={isCaseModalVisible}
        onOk={modalCaseHandleOk}
        onCancel={modalCaseHandleCancel}
        okText='确认'
        cancelText='取消'
      >
        <div className='create-task-list'>
          <div className='create-task-item'>
            案例名称：
            <input value={caseName || ''} onChange={caseNameChangeHandle} className='input'></input>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default caseBox;
