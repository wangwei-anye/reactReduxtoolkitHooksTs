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
  getTreeData
} from './slice';
import CaseBox from './caseBox';

import './index.less';
const { DirectoryTree } = Tree;

const Demo = () => {
  const [selectKeys, setSelectKeys] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const dispatch = useDispatch();
  const { treeData } = useSelector(selectCaseLib);
  if (treeData.length > 0) {
    localStorage.treeData = JSON.stringify(treeData);
  }

  useEffect(() => {
    dispatch(getTreeData());
  }, []);

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
    console.log(keys);
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
            onDoubleClick={(e) => {
              doubelClickHandle(item.key);
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
        <CaseBox></CaseBox>
      </div>
    </div>
  );
};

export default Demo;
