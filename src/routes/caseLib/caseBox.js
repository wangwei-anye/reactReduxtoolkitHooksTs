import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Select } from 'antd';
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

import './index.less';
const { Option } = Select;
const columns = [
  {
    title: 'Name',
    dataIndex: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age'
  },
  {
    title: 'Address',
    dataIndex: 'address'
  }
];

const caseBox = () => {
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const children = [];
  for (let i = 10; i < 36; i++) {
    children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
  }

  function handleChange(value) {
    console.log(`selected ${value}`);
  }

  const tableData = [];
  for (let i = 0; i < 46; i++) {
    tableData.push({
      key: i,
      name: `Edward King ${i}`,
      age: 32,
      address: `London, Park Lane no. ${i}`
    });
  }

  const onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  return (
    <div className='case-box-wrap'>
      <div className='menu-box'>
        <div className='item-btn'>
          <Button type='primary' icon={<PlusOutlined />}>
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
        <div className='select-box'>
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
        </div>
        <div className='select-box reset-btn'>
          <Button type='primary' icon={<RedoOutlined />} size={20}></Button>
          <div>重置</div>
        </div>
        <div className='select-box run-btn'>
          <span>已选案例数：{selectedRowKeys.length}</span>
          <Button type='primary' size={20}>
            运行
          </Button>
        </div>
      </div>
      <div className='list-box'>
        <Table
          rowSelection={rowSelection}
          pagination={{ pageSize: 6, position: ['bottomCenter'] }}
          columns={columns}
          dataSource={tableData}
        />
      </div>
    </div>
  );
};

export default caseBox;
