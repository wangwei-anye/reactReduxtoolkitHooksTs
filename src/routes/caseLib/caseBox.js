import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Table, Button, Select, Modal, message } from 'antd';
import {
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  ExportOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {} from './slice';
import { saveApi } from '@/services/mapEdit';
import { createTaskApi, createCaseApi, getAlgorithm } from '@/services/caseLib';
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
  const [current, setCurrent] = useState(1);
  const [algorithmArr, setAlgorithmArr] = useState([]);
  const [algorithm, setAlgorithm] = useState();
  const [taskName, setTaskName] = useState();
  const [caseInfo, setCaseInfo] = useState({
    caseName: '',
    caseTag: '',
    caseDes: ''
  });
  const [disabledBtn, setDisabledBtn] = useState(false);
  const history = useHistory();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const getAlgorithmHandle = async () => {
    const { data } = await getAlgorithm();
    if (data.code === 200) {
      setAlgorithmArr(data.data);
    }
  };
  useEffect(() => {
    getAlgorithmHandle();
  }, []);

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
    if (selectedRowKeys.length === 0) {
      message.info('请选择案例');
      return;
    }
    setTaskName('task_' + new Date().toLocaleString());
    setIsTaskModalVisible(true);
  };
  //任务
  const modalTaskHandleOk = async () => {
    if (!taskName) {
      message.info('请输入任务名称');
      return;
    }
    if (!algorithm) {
      message.info('请选择算法');
      return;
    }
    if (selectedRowKeys.length === 0) {
      message.info('请选择案例');
      return;
    }
    setDisabledBtn(true);
    const { data } = await createTaskApi({
      algorithm: algorithm,
      name: taskName,
      caseIds: selectedRowKeys.join(',')
    });
    setDisabledBtn(false);
    if (data.code === 200) {
      message.success('创建成功!');
      history.push('/task-list');
      setSelectedRowKeys([]);
      setIsTaskModalVisible(false);
    }
  };

  const modalTaskHandleCancel = () => {
    setIsTaskModalVisible(false);
  };
  const algorithmChangeHandle = (value) => {
    setAlgorithm(value);
  };
  const taskNameChangeHandle = (e) => {
    setTaskName(e.target.value);
  };
  //案例
  const addCase = () => {
    setIsCaseModalVisible(true);
  };

  const modalCaseHandleOk = async () => {
    if (!caseInfo.caseName) {
      message.info('请输入案例名称');
      return;
    }
    const result = Object.assign({}, caseInfo, {
      menuId: props.menuId
    });
    localStorage.caseInfo = JSON.stringify(result);
    // if (!caseInfo.caseTag) {
    //   message.info('请输入案例标签');
    //   return;
    // }
    // if (!caseInfo.caseDes) {
    //   message.info('请输入案例备注');
    //   return;
    // }
    window.open('./map-edit');
    setIsCaseModalVisible(false);
    // const { data } = await createCaseApi({
    //   menuId: props.menuId[0],
    //   name: caseInfo.caseName
    // });
    // if (data.code === 200) {
    //   message.success('创建成功!');
    //   setIsCaseModalVisible(false);
    // }
  };

  const modalCaseHandleCancel = () => {
    setIsCaseModalVisible(false);
  };

  const caseNameChangeHandle = (e) => {
    setCaseInfo((item) => {
      return {
        caseName: e.target.value,
        caseTag: item.caseTag,
        caseDes: item.caseDes
      };
    });
  };

  const caseTagChangeHandle = (e) => {
    setCaseInfo((item) => {
      return {
        caseName: item.caseName,
        caseTag: e.target.value,
        caseDes: item.caseDes
      };
    });
  };

  const caseDesChangeHandle = (e) => {
    setCaseInfo((item) => {
      return {
        caseName: item.caseName,
        caseTag: item.caseTag,
        caseDes: e.target.value
      };
    });
  };
  const paginationChangeHandle = (value) => {
    setCurrent(value);
    props.pageIndexChange(value);
  };

  const refreshHandle = () => {
    setCurrent(1);
    props.pageIndexChange(1);
  };

  const ref = useRef();
  const importHandle = () => {
    console.log(1111111);
    ref.current.click();
  };
  const uploadHandle = async (e) => {
    console.log(e.target.files);
    const formData = new FormData();
    formData.append('menuId', props.menuId);
    formData.append('type', 'xosc');
    formData.append('file', e.target.files[0]);
    const { data } = await saveApi(formData);
    if (data.code === 200) {
      message.success('导入成功!');
      refreshHandle();
    }
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
          <div className='item' onClick={importHandle}>
            <Button type='primary' icon={<DownloadOutlined />} size={20}></Button>
            <div>导入</div>
          </div>
          <input
            ref={ref}
            style={{ display: 'none' }}
            onChange={uploadHandle}
            accept='.xosc'
            type='file'
          ></input>
          <div className='item'>
            <Button type='primary' disabled icon={<ExportOutlined />} size={20}></Button>
            <div>导出</div>
          </div>
          <div className='item'>
            <Button type='primary' disabled icon={<EditOutlined />} size={20}></Button>
            <div>编辑</div>
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
            current,
            pageSize: DEFAULT_PAGE_SIZE,
            position: ['bottomCenter'],
            total: props.listData.total,
            onChange: paginationChangeHandle
          }}
          columns={columns}
          rowKey='id'
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
        okButtonProps={{
          disabled: disabledBtn
        }}
      >
        <div className='create-task-list'>
          <div className='create-task-item'>
            任务名称：
            <input value={taskName || ''} onChange={taskNameChangeHandle} className='input'></input>
          </div>
          <div className='create-task-item'>
            算法类型：{console.log()}
            <Select defaultValue='请选择' onChange={algorithmChangeHandle} className='select'>
              {algorithmArr.map((item, index) => {
                return (
                  <Option key={index} value={item}>
                    {item}
                  </Option>
                );
              })}
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
            <input
              value={caseInfo.caseName || ''}
              onChange={caseNameChangeHandle}
              className='input'
            ></input>
          </div>
          {/* <div className='create-task-item'>
            案例标签：
            <input
              value={caseInfo.caseTag || ''}
              onChange={caseTagChangeHandle}
              className='input'
            ></input>
          </div>
          <div className='create-task-item'>
            案例备注：
            <input
              value={caseInfo.caseDes || ''}
              onChange={caseDesChangeHandle}
              className='input'
            ></input>
          </div> */}
        </div>
      </Modal>
    </div>
  );
};

export default caseBox;
