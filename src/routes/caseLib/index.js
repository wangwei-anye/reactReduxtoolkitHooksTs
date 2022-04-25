import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tree, Tooltip, Button } from 'antd';
import { FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { editFile, selectCaseLib, getMenuData, getListData } from './slice';
import { createMenuDataApi, deleteMenuDataApi, renameMenuDataApi } from '@/services/caseLib';
import CaseBox from './caseBox';
import { DEFAULT_PAGE_SIZE } from '@/constants';

import './index.less';
const { DirectoryTree } = Tree;

const CaseLib = () => {
  const [inputValue, setInputValue] = useState('');
  const dispatch = useDispatch();
  //菜单列表
  const { treeData } = useSelector(selectCaseLib);
  //菜单key
  const [selectKeys, setSelectKeys] = useState([]);
  //1 只读 ， 0 可操作 ， 2 ：点击空白切换到主菜单，可新增，不可删除
  const [readonly, setReadonly] = useState(1);

  const { listData } = useSelector(selectCaseLib);
  const childRef = useRef();

  useEffect(() => {
    dispatch(getMenuData());
  }, []);

  useEffect(() => {
    if (treeData.length > 0) {
      if (selectKeys.length === 0) {
        setSelectKeys([treeData[0].key]);
        setReadonly(1);
        queryList(treeData[0].key);
      }
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

  const createFileHandle = async () => {
    if (readonly === 1) {
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
      queryList(keys[0]);
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
    //点击文件列表空白处 ，定位到主菜单
    if (e.target && e.target.className && e.target.className === 'file-list') {
      setSelectKeys(['1495941982176391170']); //主菜单
      setReadonly(2);
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

  const renderData = () => {
    const jsonTreeData = JSON.parse(JSON.stringify(treeData));
    const result = renderDataHandle(jsonTreeData);
    return result;
  };

  return (
    <div className='case-lib-wrap'>
      <div className='file-box' onClick={clickFileBoxHandle}>
        <div className='title'>测试案例库</div>
        <div className='btn-menu'>
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
        <div className='file-list'>
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
      </div>
      <div className='content-box'>
        <CaseBox
          listData={listData}
          menuId={selectKeys}
          ref={childRef}
          readOnly={readonly === 1 || readonly === 2 ? true : false}
          pageIndexChange={pageIndexChange}
        ></CaseBox>
      </div>
    </div>
  );
};

export default CaseLib;
