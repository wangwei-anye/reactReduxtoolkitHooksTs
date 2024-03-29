import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo
} from 'react';
import { useHistory } from 'react-router-dom';
import { Table, Button, Select, Modal, message, Progress } from 'antd';
import {
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  ExportOutlined,
  PlusOutlined,
  FolderViewOutlined
} from '@ant-design/icons';
import YAML from 'yaml';
import getReplayDataFromXosc, { getDataFromFileHandle } from '@/utils/getReplayDataFromXosc';
import { saveApi } from '@/services/mapEdit';
import { deleteCaseApi, getAlgorithm } from '@/services/caseLib';
import { createTaskApi } from '@/services/task';
import { ASSERT_SERVE } from '@/constants';
import { download } from '@/utils/tools';
import { DEFAULT_PAGE_SIZE } from '@/constants';

import './index.less';
const { Option } = Select;
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
let xosc_uploadFiles = [];
let xosc_uploadIndex = 0;
let xosc_uploadTotal = 0;
let xosc_file_no_map = [];
let input_target;
const caseBox = (props, ref) => {
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isCaseModalVisible, setIsCaseModalVisible] = useState(false);
  const [current, setCurrent] = useState(1);
  const [algorithmArr, setAlgorithmArr] = useState([]);
  const [algorithm, setAlgorithm] = useState();
  const [taskName, setTaskName] = useState();
  const [caseInfo, setCaseInfo] = useState({
    caseName: '',
    caseTag: ''
  });
  const [disabledBtn, setDisabledBtn] = useState(false);
  const history = useHistory();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [uploadIndex, setUploadIndex] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadMoadlVisible, setUploadMoadlVisible] = useState(false);

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
      setSelectedRowKeys([]);
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
          `${ASSERT_SERVE}${props.listData.records[i].caseFileUrl}`
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
        window.open(
          `./view?xoscUrl=${props.listData.records[i].caseFileUrl}&mapUrl=${props.listData.records[i].mapName}`
        );
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
    }
  }));

  const paginationChangeHandle = (value) => {
    setCurrent(value);
    props.pageIndexChange(value);
  };

  const refreshHandle = () => {
    setCurrent(1);
    props.pageIndexChange(1);
  };

  const refUpload = useRef();
  const importHandle = () => {
    refUpload.current.click();
  };

  const uploadHandle = async (e) => {
    input_target = e.target;
    if (e.target.files.length > 0) {
      setUploadIndex(0);
      setUploadTotal(e.target.files.length);
      xosc_uploadIndex = 0;
      xosc_file_no_map = [];
      xosc_uploadTotal = e.target.files.length;
      xosc_uploadFiles = e.target.files;
      setUploadMoadlVisible(true);
      uploadXoscHandle();
    }
  };
  //批量上传XOSC
  const uploadXoscHandle = async () => {
    if (xosc_uploadIndex >= xosc_uploadTotal) {
      refreshHandle();
      setUploadMoadlVisible(false);
      input_target.value = '';
      if (xosc_file_no_map.length > 0) {
        Modal.warning({
          title: '提示',
          okText: '知道了',
          width: 500,
          maskClosable: true,
          content: (
            <span>
              {xosc_file_no_map.map((item, index) => {
                return (
                  <div key={index}>
                    地图<span style={{ color: 'red' }}>{item}</span>不存在
                  </div>
                );
              })}
            </span>
          )
        });
      }
      return;
    }
    uploadXoscItemHandle(xosc_uploadFiles[xosc_uploadIndex]);
  };

  const uploadXoscItemHandle = async (file) => {
    const type = file.name.split('.')[1];
    const formData = new FormData();
    formData.append('menuId', props.menuId);
    formData.append('type', type);
    formData.append('file', file);
    let mapName;
    if (type === 'xosc') {
      try {
        const initScenarioEngine = await getReplayDataFromXosc(file, 2);
        const scenarioEngine = initScenarioEngine();
        const result = scenarioEngine.getOdrFilename();
        const resultArr = result.split('/');
        mapName = resultArr[resultArr.length - 1];
        formData.append('mapName', mapName);
      } catch (error) {}
    }
    if (type === 'yaml') {
      try {
        const yamlData = await getDataFromFileHandle(file);
        const yamlJson = YAML.parse(yamlData);
        const resultArr = yamlJson.MapFileName.split('/');
        mapName = resultArr[resultArr.length - 1];
        formData.append('mapName', mapName);
      } catch (error) {}
    }
    const { data } = await saveApi(formData);
    if (data.code === 501) {
      if (!xosc_file_no_map.includes(mapName)) {
        xosc_file_no_map.push(mapName);
      }
    }
    xosc_uploadIndex++;
    setUploadIndex(xosc_uploadIndex);
    uploadXoscHandle();
  };

  const progressNum = useMemo(() => {
    return parseInt((uploadIndex / uploadTotal) * 100);
  }, [uploadIndex]);

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
            multiple={true}
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
            showSizeChanger: false,
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
      <Modal title='上传进度' className='upload-xosc-modal' visible={uploadMoadlVisible} footer=''>
        <Progress percent={progressNum} />
      </Modal>
    </div>
  );
};

export default forwardRef(caseBox);
