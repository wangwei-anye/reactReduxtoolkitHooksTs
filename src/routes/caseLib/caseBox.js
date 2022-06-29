import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Table,
  Button,
  Select,
  Modal,
  message,
  Input,
  DatePicker,
  Pagination,
  Checkbox
} from 'antd';
import {
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  ExportOutlined,
  PlusOutlined,
  FolderViewOutlined,
  RedoOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {} from './slice';
import { saveApi } from '@/services/mapEdit';
import { deleteCaseApi, getAlgorithm } from '@/services/caseLib';
import { createTaskApi } from '@/services/task';
import { download } from '@/utils/tools';
import { DEFAULT_PAGE_SIZE } from '@/constants';

import './index.less';
const { Option } = Select;
const { RangePicker } = DatePicker;
const columns = [
  {
    title: 'ID',
    dataIndex: 'id'
  },
  {
    title: '名称',
    dataIndex: 'name'
  },
  {
    title: '类型',
    dataIndex: 'type'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime'
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime'
  },
  {
    title: '标签',
    dataIndex: 'tags'
  }
];

const caseBox = (props, ref) => {
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isCaseModalVisible, setIsCaseModalVisible] = useState(false);
  const [current, setCurrent] = useState(1);
  // const [quickTestCurrent, setQuickTestCurrent] = useState(1);
  const [algorithmArr, setAlgorithmArr] = useState([]);
  const [algorithm, setAlgorithm] = useState();
  const [taskName, setTaskName] = useState();
  const [caseInfo, setCaseInfo] = useState({
    caseName: '',
    caseTag: ''
  });
  const [disabledBtn, setDisabledBtn] = useState(false);
  const [inputTime, setInputTime] = useState(null);
  const [inputTimeStr, setInputTimeStr] = useState(null);
  const [inputTag, setInputTag] = useState(null);

  const history = useHistory();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [isManage, setIsManage] = useState(false);
  const [checkFlagList, setCheckFlagList] = useState([]);
  const [removeFlagList, setRemoveFlagList] = useState([]);
  const [createTaskType, setCreateTaskType] = useState('');
  const CREATE_TASK_TYPE = {
    CASE: 'case',
    QUICK_TEST: 'quick_test'
  };

  const getAlgorithmHandle = async () => {
    const { data } = await getAlgorithm();
    if (data.code === 200) {
      setAlgorithmArr(data.data);
    }
  };
  useEffect(() => {
    getAlgorithmHandle();
  }, []);

  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const deleteHandle = async () => {
    if (selectedRowKeys.length === 0) {
      message.info('请选择案例');
      return;
    }
    const { data } = await deleteCaseApi({
      ids: selectedRowKeys.join(',')
    });
    if (data.code === 200) {
      message.success('删除成功!');
      refreshHandle();
    }
  };

  const exportHandle = async () => {
    if (selectedRowKeys.length === 0) {
      message.info('请选择案例');
      return;
    }
    for (let i = 0; i < props.listData.records.length; i++) {
      if (selectedRowKeys.includes(props.listData.records[i].id)) {
        download(
          `${props.listData.records[i].name}.${props.listData.records[i].type}`,
          props.listData.records[i].caseFileUrl
        );
      }
    }
  };

  const lookHandle = async () => {
    if (selectedRowKeys.length === 0) {
      message.info('请选择案例');
      return;
    }
    if (selectedRowKeys.length > 1) {
      message.info('一次只能编辑一个案例');
      return;
    }
    for (let i = 0; i < props.listData.records.length; i++) {
      if (selectedRowKeys.includes(props.listData.records[i].id)) {
        if (props.listData.records[i].type !== 'xosc') {
          message.info('只能查看xosc文件');
          return;
        }
        localStorage.xoscUrl = props.listData.records[i].caseFileUrl;
        window.open('./view');
      }
    }
  };

  const editHandle = async () => {
    if (selectedRowKeys.length === 0) {
      message.info('请选择案例');
      return;
    }
    if (selectedRowKeys.length > 1) {
      message.info('一次只能编辑一个案例');
      return;
    }
    for (let i = 0; i < props.listData.records.length; i++) {
      if (selectedRowKeys.includes(props.listData.records[i].id)) {
        if (props.listData.records[i].type !== 'yaml') {
          message.info('只能编辑yaml文件');
          return;
        }
        localStorage.caseType = 'edit';
        localStorage.caseInfo = JSON.stringify({
          id: props.listData.records[i].id,
          caseName: props.listData.records[i].name,
          caseTag: props.listData.records[i].tags,
          menuId: props.menuId
        });
        localStorage.caseData = props.listData.records[i].caseFileUrl;
        window.open('./map-edit');
      }
    }
  };

  const run = () => {
    if (selectedRowKeys.length === 0) {
      message.info('请选择案例');
      return;
    }
    setCreateTaskType(CREATE_TASK_TYPE.CASE);
    setTaskName('task_' + new Date().toLocaleString());
    setIsTaskModalVisible(true);
  };

  const runQuickTestHandle = () => {
    if (props.quickTestListData.records.length === 0) {
      message.info('该测试集为空');
      return;
    }
    setCreateTaskType(CREATE_TASK_TYPE.QUICK_TEST);
    setTaskName('task_' + new Date().toLocaleString());
    setIsTaskModalVisible(true);
  };

  const addToQuickTest = () => {
    if (selectedRowKeys.length === 0) {
      message.info('请选择案例');
      return;
    }
    props.addToTestHandle(selectedRowKeys.join(','));
    setSelectedRowKeys([]);
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

    let caseIds = '';
    if (createTaskType === CREATE_TASK_TYPE.CASE) {
      caseIds = selectedRowKeys.join(',');
    } else {
      const quickTestKey = [];
      for (let i = 0; i < props.quickTestListData.records.length; i++) {
        quickTestKey.push(props.quickTestListData.records[i].id);
      }
      caseIds = quickTestKey.join(',');
    }
    setDisabledBtn(true);
    const { data } = await createTaskApi({
      algorithm: algorithm,
      name: taskName,
      caseIds: caseIds
    });
    setDisabledBtn(false);
    if (data.code === 200) {
      message.success('创建成功!');
      setSelectedRowKeys([]);
      setIsTaskModalVisible(false);
      history.push('/task-list');
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
    localStorage.caseType = 'create';
    localStorage.caseInfo = JSON.stringify(result);
    window.open('./map-edit');
    setIsCaseModalVisible(false);
  };

  const modalCaseHandleCancel = () => {
    setIsCaseModalVisible(false);
  };

  const caseNameChangeHandle = (e) => {
    setCaseInfo((item) => {
      return {
        caseName: e.target.value,
        caseTag: item.caseTag
      };
    });
  };

  const caseTagChangeHandle = (e) => {
    setCaseInfo((item) => {
      return {
        caseName: item.caseName,
        caseTag: e.target.value
      };
    });
  };

  useImperativeHandle(ref, () => ({
    // changeVal 就是暴露给父组件的方法
    setCurrent: (newVal) => {
      setCurrent(newVal);
    },
    getParam: () => {
      return {
        createTimeStart: inputTimeStr && inputTimeStr[0],
        createTimeEnd: inputTimeStr && inputTimeStr[1],
        tags: inputTag
      };
    }
  }));

  const paginationChangeHandle = (value) => {
    setCurrent(value);
    props.pageIndexChange(value, {
      createTimeStart: inputTimeStr && inputTimeStr[0],
      createTimeEnd: inputTimeStr && inputTimeStr[1],
      tags: inputTag
    });
  };

  // const quickTestpaginationChangeHandle = (value) => {
  //   setQuickTestCurrent(value);
  //   props.quickTestPageIndexChange(value);
  // };

  const refreshHandle = () => {
    setCurrent(1);
    props.pageIndexChange(1, {
      createTimeStart: inputTimeStr && inputTimeStr[0],
      createTimeEnd: inputTimeStr && inputTimeStr[1],
      tags: inputTag
    });
  };

  const refUpload = useRef();
  const importHandle = () => {
    refUpload.current.click();
  };
  const uploadHandle = async (e) => {
    const type = e.target.files[0].name.split('.')[1];
    const formData = new FormData();
    formData.append('menuId', props.menuId);
    formData.append('type', type);
    formData.append('file', e.target.files[0]);
    const { data } = await saveApi(formData);
    if (data.code === 200) {
      message.success('导入成功!');
      refreshHandle();
    }
  };

  const inputTimeChangeHandle = (val, dateString) => {
    setInputTime(val);
    setInputTimeStr(dateString);
  };

  const inputTagChangeHandle = (e) => {
    setInputTag(e.target.value);
  };

  const searchHandle = () => {
    setCurrent(1);
    props.pageIndexChange(1, {
      createTimeStart: inputTimeStr && inputTimeStr[0],
      createTimeEnd: inputTimeStr && inputTimeStr[1],
      tags: inputTag
    });
  };

  const resetHandle = () => {
    setInputTime(null);
    setInputTimeStr(null);
    setInputTag(null);
    setCurrent(1);
    props.pageIndexChange(1, {
      createTimeStart: null,
      createTimeEnd: null,
      tags: null
    });
  };

  const changeCheckBoxHandle = (e, item) => {
    if (e.target.checked) {
      setCheckFlagList((prevState) => {
        return [...prevState, item.id];
      });
    } else {
      setCheckFlagList((prevState) => {
        prevState.splice(prevState.indexOf(item.id), 1);
        return [...prevState];
      });
    }
  };

  const saveQuickTestListHandle = async () => {
    const caseIds = [];
    for (let i = 0; i < props.quickTestListData.records.length; i++) {
      if (!removeFlagList.includes(props.quickTestListData.records[i].id)) {
        caseIds.push(props.quickTestListData.records[i].id);
      }
    }
    const data = await props.manageTestHandle(caseIds.join(','));
    if (data === 'success') {
      setIsManage(false);
      setRemoveFlagList([]);
      setCheckFlagList([]);
    }
  };
  const cancelQuickTestListHandle = () => {
    setIsManage(false);
    setRemoveFlagList([]);
    setCheckFlagList([]);
  };

  const removeQuickTestListHandle = () => {
    setRemoveFlagList((prevState) => {
      return [...prevState, ...checkFlagList];
    });
    setCheckFlagList([]);
  };

  return (
    <div className='case-box-wrap'>
      <div className='menu-box'>
        <div className='item-btn'>
          <Button
            type='primary'
            disabled={props.readOnly}
            onClick={addCase}
            icon={<PlusOutlined />}
          >
            新建案例
          </Button>
        </div>
        <div className='item-list'>
          <div className='item' onClick={importHandle}>
            <Button
              type='primary'
              disabled={props.readOnly}
              icon={<DownloadOutlined />}
              size={20}
            ></Button>
            <div>导入</div>
          </div>
          <input
            ref={refUpload}
            style={{ display: 'none' }}
            onChange={uploadHandle}
            accept='.xosc,.yaml'
            type='file'
          ></input>
          <div className='item'>
            <Button
              type='primary'
              onClick={exportHandle}
              icon={<ExportOutlined />}
              size={20}
            ></Button>
            <div>导出</div>
          </div>
          <div className='item'>
            <Button
              type='primary'
              disabled={props.readOnly}
              onClick={editHandle}
              icon={<EditOutlined />}
              size={20}
            ></Button>
            <div>编辑</div>
          </div>
          <div className='item'>
            <Button
              type='primary'
              onClick={lookHandle}
              icon={<FolderViewOutlined />}
              size={20}
            ></Button>
            <div>查看</div>
          </div>
          <div className='item'>
            <Button
              type='primary'
              onClick={deleteHandle}
              disabled={props.readOnly}
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
      </div>
      <div className='search-box'>
        <div className='select-box time'>
          <span className='title'>创建时间:</span>
          <span className='val'>
            <RangePicker
              showTime
              value={inputTime}
              placeholder={['开始日期', '结束日期']}
              onChange={inputTimeChangeHandle}
            />
          </span>
        </div>
        <div className='select-box'>
          <span className='title'>标签:</span>
          <span className='val tag'>
            <Input value={inputTag} onChange={inputTagChangeHandle}></Input>{' '}
          </span>
        </div>
        <div className='btn-box btn'>
          <Button type='primary' onClick={searchHandle} icon={<SearchOutlined />}></Button>
          <div>搜索</div>
        </div>
        <div className='btn-box btn'>
          <Button type='primary' onClick={resetHandle} icon={<RedoOutlined />} size={20}></Button>
          <div>重置</div>
        </div>
      </div>
      <div className='list-box'>
        <Table
          rowSelection={rowSelection}
          pagination={false}
          // pagination={{
          //   current,
          //   pageSize: DEFAULT_PAGE_SIZE,
          //   position: ['bottomCenter'],
          //   total: props.listData.total,
          //   showSizeChanger: false,
          //   onChange: paginationChangeHandle
          // }}
          columns={columns}
          rowKey='id'
          dataSource={props.listData.records}
        />
      </div>
      <div className='list-tool-bar'>
        <div className='page-bar'>
          <Pagination
            current={current}
            pageSize={DEFAULT_PAGE_SIZE}
            total={props.listData.total}
            showSizeChanger={false}
            onChange={paginationChangeHandle}
          ></Pagination>
        </div>
        <div className='btn-bar'>
          <span className='tips'>已选案例数：{selectedRowKeys.length}</span>
          <Button className='run-btn' type='primary' size={20} onClick={run}>
            运行
          </Button>
          <Button className='add-test-btn' type='primary' size={20} onClick={addToQuickTest}>
            加入快速测试集
          </Button>
        </div>
      </div>
      <div className='quick-test-title'>
        <span>测试集({props.quickTestListData.records.length})</span>
        <div className='manage-btn'>
          {isManage ? null : (
            <Button
              type='primary'
              size={20}
              onClick={() => {
                setIsManage(true);
              }}
            >
              管理
            </Button>
          )}
        </div>
      </div>
      <div className='quick-test-list-box'>
        <div className='list-box-item'>
          {props.quickTestListData.records.map((item, index) => {
            if (removeFlagList.includes(item.id)) {
              return null;
            }
            return (
              <div className='item' key={index}>
                {isManage ? (
                  <Checkbox
                    onChange={(e) => {
                      changeCheckBoxHandle(e, item);
                    }}
                  >
                    {item.name}
                  </Checkbox>
                ) : (
                  <span>{item.name}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className='quick-test-list-tool-bar'>
        {/* <div className='page-bar'>
          <Pagination
            current={quickTestCurrent}
            pageSize={DEFAULT_PAGE_SIZE}
            total={props.quickTestListData.total}
            showSizeChanger={false}
            onChange={quickTestpaginationChangeHandle}
          ></Pagination>
        </div> */}
        <div className='btn-bar'>
          {isManage ? (
            <React.Fragment>
              <Button className='btn' type='primary' size={20} onClick={removeQuickTestListHandle}>
                移除
              </Button>
              <Button className='btn' type='primary' size={20} onClick={saveQuickTestListHandle}>
                确定
              </Button>
              <Button className='btn' size={20} onClick={cancelQuickTestListHandle}>
                取消
              </Button>
            </React.Fragment>
          ) : (
            <Button className='btn' type='primary' size={20} onClick={runQuickTestHandle}>
              运行
            </Button>
          )}
        </div>
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
            算法类型：
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
          <div className='create-task-item'>
            案例总数：
            {createTaskType === CREATE_TASK_TYPE.CASE
              ? selectedRowKeys.length
              : props.quickTestListData.records.length}
          </div>
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
          <div className='create-task-item'>
            案例标签：
            <input
              value={caseInfo.caseTag || ''}
              onChange={caseTagChangeHandle}
              className='input'
            ></input>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default forwardRef(caseBox);
