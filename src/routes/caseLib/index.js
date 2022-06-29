import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tree, Tooltip, message } from 'antd';
import { FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  editFile,
  selectCaseLib,
  getMenuData,
  getQuickTestMenuData,
  getListData,
  getQuickTestListData
} from './slice';
import {
  createMenuDataApi,
  createQuickTestMenuDataApi,
  deleteMenuDataApi,
  renameMenuDataApi,
  addToTestApi,
  manageTestApi
} from '@/services/caseLib';
import CaseBox from './caseBox';
import { DEFAULT_PAGE_SIZE } from '@/constants';

import './index.less';
const { DirectoryTree } = Tree;

const CaseLib = () => {
  const [inputValue, setInputValue] = useState('');
  const dispatch = useDispatch();
  //菜单列表
  const { treeData, listData, quickTestTreeData, quickTestListData } = useSelector(selectCaseLib);
  //菜单key
  const [selectKeys, setSelectKeys] = useState([]);
  //快速测试集菜单key
  const [quickTestSelectKeys, setQuickTestSelectKeys] = useState([]);
  //1 只读 ， 0 可操作 ， 2 ：点击空白切换到主菜单，可新增，不可删除
  const [readonly, setReadonly] = useState(0);

  const childRef = useRef();

  useEffect(() => {
    dispatch(getMenuData());
    dispatch(getQuickTestMenuData());
  }, []);

  useEffect(() => {
    if (treeData.length > 0) {
      if (selectKeys.length === 0) {
        setSelectKeys([treeData[0].key]);
        setReadonly(treeData[0].readOnly);
        queryList(treeData[0].key);
      }
    }
  }, [treeData]);
  useEffect(() => {
    if (quickTestTreeData.length > 0) {
      if (quickTestSelectKeys.length === 0) {
        setQuickTestSelectKeys([quickTestTreeData[0].key]);
        queryQuickTestList(quickTestTreeData[0].key);
      }
    }
  }, [quickTestTreeData]);

  const pageIndexChange = useCallback((value, param) => {
    queryList(selectKeys[0], value, param);
  });

  // const quickTestPageIndexChange = useCallback((value) => {
  //   queryQuickTestList(quickTestSelectKeys[0], value);
  // });

  const queryList = (menuId, current = 1, param = {}) => {
    dispatch(
      getListData({
        menuIds: menuId,
        current,
        size: DEFAULT_PAGE_SIZE,
        ...param
      })
    );
  };

  const queryQuickTestList = (menuId, current = 1) => {
    dispatch(
      getQuickTestListData({
        menuId: menuId,
        current,
        size: 1000
      })
    );
  };

  const createFileHandle = async () => {
    if (readonly === 1) {
      //定位到主菜单
      setSelectKeys(['1495941982176391170']); //主菜单
      setReadonly(2);
      return;
    }
    const { data } = await createMenuDataApi({
      name: 'new',
      parentId: selectKeys[0]
    });
    if (data.code === 200) {
      setSelectKeys([data.data]);
      setReadonly(0);
      dispatch(getMenuData());
      queryList(data.data);
    }
  };

  const createQuickTestFileHandle = async () => {
    let key = '';
    if (quickTestSelectKeys.length === 0) {
      key = '1';
    } else {
      key = quickTestSelectKeys[0];
    }
    const { data } = await createQuickTestMenuDataApi({
      name: 'new',
      parentId: key
    });
    if (data.code === 200) {
      setQuickTestSelectKeys([data.data]);
      dispatch(getQuickTestMenuData());
    }
  };

  const deleteFileHandle = async () => {
    if (readonly === 1 || readonly === 2) {
      return;
    }
    const { data } = await deleteMenuDataApi({
      id: selectKeys[0]
    });
    if (data.code === 200) {
      setSelectKeys([]);
      setReadonly(1);
      dispatch(getMenuData());
    }
  };

  const deleteQuickTestFileHandle = async () => {
    const { data } = await deleteMenuDataApi({
      id: quickTestSelectKeys[0]
    });
    if (data.code === 200) {
      setQuickTestSelectKeys([]);
      dispatch(getQuickTestMenuData());
    }
  };

  const addToTestHandle = async (caseIds) => {
    if (quickTestSelectKeys.length === 0) {
      message.info('请先选中一个快速测试集文件夹');
      return;
    }
    const { data } = await addToTestApi({
      menuId: quickTestSelectKeys[0],
      caseIds: caseIds
    });
    if (data.code === 200) {
      queryQuickTestList(quickTestSelectKeys[0]);
    }
  };

  const manageTestHandle = async (caseIds) => {
    const { data } = await manageTestApi({
      menuId: quickTestSelectKeys[0],
      caseIds: caseIds
    });
    if (data.code === 200) {
      queryQuickTestList(quickTestSelectKeys[0]);
      return 'success';
    }
    return 'error';
  };

  const changeHandle = (e) => {
    setInputValue(e.target.value);
  };
  const onSelect = (keys, info) => {
    if (keys[0] === selectKeys[0]) {
      return;
    }
    setReadonly(info.node.readOnly);
    setSelectKeys(keys);
    if (keys.length > 0) {
      childRef.current.setCurrent(1);
      const param = childRef.current.getParam();
      queryList(keys[0], 1, param);
    }
  };

  const onQuickTestSelect = (keys, info) => {
    if (keys[0] === quickTestSelectKeys[0]) {
      return;
    }
    setQuickTestSelectKeys(keys);
    if (keys.length > 0) {
      queryQuickTestList(keys[0], 1);
    }
  };

  const blurHandle = async (item) => {
    if (inputValue.trim() === '') {
      setInputValue('');
      doubelClickHandle(item.key, false);
      return;
    }
    const { data } = await renameMenuDataApi({
      id: item.key,
      name: inputValue
    });
    setInputValue('');
    if (data.code === 200) {
      dispatch(getMenuData());
      dispatch(getQuickTestMenuData());
    }
  };
  const doubelClickHandle = (key, isEditable) => {
    dispatch(
      editFile({
        key,
        isEditable
      })
    );
  };
  const clickFileBoxHandle = (e) => {
    if (typeof e.target.className !== 'string') {
      return;
    }
    //点击文件列表空白处 ，定位到主菜单
    if (e.target && e.target.className && e.target.className.indexOf('case-click-area') !== -1) {
      setSelectKeys(['1495941982176391170']); //主菜单
      setReadonly(2);
    }
    if (
      e.target &&
      e.target.className &&
      e.target.className.indexOf('quick-test-click-area') !== -1
    ) {
      setQuickTestSelectKeys(['1']); //主菜单
    }
  };

  //根据slice 的treeData生成渲染树  递归handle
  const renderDataHandle = (dataArr) => {
    return dataArr.map((item) => {
      if (item.isEditable) {
        item.title = (
          <input
            value={inputValue}
            style={{ color: 'black' }}
            onChange={changeHandle}
            onBlur={() => {
              blurHandle(item);
            }}
          />
        );
      } else {
        item.title = (
          <span
            onDoubleClick={(e) => {
              if (item.readOnly === 0) {
                doubelClickHandle(item.key, true);
              }
            }}
          >
            {item.title}
          </span>
        );
      }
      if (item.children) {
        renderDataHandle(item.children);
      }
      return item;
    });
  };

  const renderData = (data) => {
    const jsonTreeData = JSON.parse(JSON.stringify(data));
    const result = renderDataHandle(jsonTreeData);
    return result;
  };

  return (
    <div className='case-lib-wrap'>
      <div className='file-box' onClick={clickFileBoxHandle}>
        <div className='title case-click-area'>测试案例库</div>
        <div className='btn-menu case-click-area'>
          <span className='btn-new' onClick={createFileHandle}>
            <FileAddOutlined style={{ color: readonly === 1 ? '#ccc' : 'rgba(0, 0, 0, 0.85)' }} />
            <span
              className='btn-txt'
              style={{ color: readonly === 1 ? '#ccc' : 'rgba(0, 0, 0, 0.85)' }}
            >
              新建
            </span>
          </span>
          <span className='btn-delete' onClick={deleteFileHandle}>
            <Tooltip placement='bottom' title='删除'>
              <DeleteOutlined
                style={{ color: readonly === 1 || readonly === 2 ? '#ccc' : 'rgba(0, 0, 0, 0.85)' }}
              />
            </Tooltip>
          </span>
        </div>
        <div className='file-list case-click-area'>
          {treeData.length > 0 ? (
            <DirectoryTree
              defaultExpandAll
              selectedKeys={selectKeys}
              onSelect={onSelect}
              expandAction={false}
              treeData={renderData(treeData)}
            />
          ) : null}
        </div>
        <div className='title quick-test-click-area'>快速测试集</div>
        <div className='btn-menu quick-test-click-area'>
          <span className='btn-new' onClick={createQuickTestFileHandle}>
            <FileAddOutlined />
            <span className='btn-txt'>新建</span>
          </span>
          <span className='btn-delete' onClick={deleteQuickTestFileHandle}>
            <Tooltip placement='bottom' title='删除'>
              <DeleteOutlined />
            </Tooltip>
          </span>
        </div>
        <div className='quick-test-file-list quick-test-click-area'>
          {treeData.length > 0 ? (
            <DirectoryTree
              defaultExpandAll
              selectedKeys={quickTestSelectKeys}
              onSelect={onQuickTestSelect}
              expandAction={false}
              treeData={renderData(quickTestTreeData)}
            />
          ) : null}
        </div>
      </div>
      <div className='content-box'>
        <CaseBox
          listData={listData}
          quickTestListData={quickTestListData}
          menuId={selectKeys}
          ref={childRef}
          readOnly={readonly === 1 || readonly === 2 ? true : false}
          pageIndexChange={pageIndexChange}
          // quickTestPageIndexChange={quickTestPageIndexChange}
          addToTestHandle={addToTestHandle}
          manageTestHandle={manageTestHandle}
        ></CaseBox>
      </div>
    </div>
  );
};

export default CaseLib;
