import React, { useState, useEffect, useCallback } from 'react';
import { Tree, Tooltip, Button } from 'antd';
import { FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  createFile,
  deleteFile,
  editSuccessFile,
  editStartFile,
  selectCaseLib,
  getMenuData,
  getListData
} from './slice';
import CaseBox from './caseBox';
import { DEFAULT_PAGE_SIZE } from '@/constants';

import './index.less';
const { DirectoryTree } = Tree;

const Demo = () => {
  const [selectKeys, setSelectKeys] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const dispatch = useDispatch();
  const { treeData } = useSelector(selectCaseLib);
  const { listData } = useSelector(selectCaseLib);

  useEffect(() => {
    dispatch(getMenuData());
  }, []);

  useEffect(() => {
    if (treeData.length > 0) {
      setSelectKeys([treeData[0].key]);
      queryList(treeData[0].key);
    }
  }, [treeData]);

  const pageIndexChange = useCallback((value) => {
    queryList(selectKeys[0], value);
  });

  const queryList = (menuId, current = 1) => {
    dispatch(
      getListData({
        menuId,
        current,
        size: DEFAULT_PAGE_SIZE
      })
    );
  };

  const createFileHandle = () => {
    dispatch(createFile(selectKeys[0]));
  };
  const deleteFileHandle = () => {
    dispatch(deleteFile(selectKeys[0]));
  };
  const changeHandle = (e) => {
    setInputValue(e.target.value);
  };
  const onSelect = (keys, info) => {
    setSelectKeys(keys);
    if (keys.length > 0) {
      queryList(keys[0]);
    }
  };
  const blurHandle = (e) => {
    dispatch(editSuccessFile(inputValue));
    setInputValue('');
  };
  const doubelClickHandle = (key) => {
    dispatch(editStartFile(key));
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
            onBlur={blurHandle}
          />
        );
      } else {
        item.title = (
          <span
          // onDoubleClick={(e) => {
          //   doubelClickHandle(item.key);
          // }}
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
  const jsonTreeData = JSON.parse(JSON.stringify(treeData));

  return (
    <div className='case-lib-wrap'>
      <div className='file-box'>
        <div className='title'>测试案例库</div>
        <div className='btn-menu'>
          <span className='btn-new' onClick={createFileHandle}>
            <FileAddOutlined />
            <span className='btn-txt'>新建</span>
          </span>
          <span className='btn-delete' onClick={deleteFileHandle}>
            <Tooltip placement='bottom' title='删除'>
              <DeleteOutlined />
            </Tooltip>
          </span>
        </div>
        <div className='file-list'>
          {treeData.length > 0 ? (
            <DirectoryTree
              defaultExpandAll
              onSelect={onSelect}
              treeData={renderDataHandle(jsonTreeData)}
            />
          ) : null}
        </div>
      </div>
      <div className='content-box'>
        <CaseBox
          listData={listData}
          menuId={selectKeys}
          pageIndexChange={pageIndexChange}
        ></CaseBox>
      </div>
    </div>
  );
};

export default Demo;
