import React, { useState, useMemo } from 'react';
import { Tree } from 'antd';
import {
  Resource_lib_tree,
  Resource_list_map,
  RESOURCE_TYPE,
  Resource_list_main_car,
  Resource_list_element_car,
  Resource_list_element_people,
  Resource_list_element_bicycle,
  Resource_list_triggers,
  Resource_list_element_animal
} from '../mapEdit/lib/constant';
import './index.less';

const { DirectoryTree } = Tree;
const Resource = () => {
  //切换资源库类型
  const [resourceLibType, setResourceLibType] = useState(RESOURCE_TYPE.MAP);
  // 资源库切换
  const onResourceLibHandle = (keys) => {
    console.log(keys);
    setResourceLibType(keys[0]);
  };

  //文件库
  const renderResourceList = useMemo(() => {
    console.log('renderResourceList');
    let Resource_list = [];
    if (resourceLibType === RESOURCE_TYPE.MAP) {
      Resource_list = Resource_list_map;
    } else if (resourceLibType === RESOURCE_TYPE.MAIN_CAR) {
      Resource_list = Resource_list_main_car;
    } else if (resourceLibType === RESOURCE_TYPE.ELEMENT_CAR) {
      Resource_list = Resource_list_element_car;
    } else if (resourceLibType === RESOURCE_TYPE.ELEMENT_PEOPLE) {
      Resource_list = Resource_list_element_people;
    } else if (resourceLibType === RESOURCE_TYPE.ELEMENT_BICYCLE) {
      Resource_list = Resource_list_element_bicycle;
    } else if (resourceLibType === RESOURCE_TYPE.TRIGGERS) {
      Resource_list = Resource_list_triggers;
    } else if (resourceLibType === RESOURCE_TYPE.ELEMENT_ANIMAL) {
      Resource_list = Resource_list_element_animal;
    }
    return Resource_list.map((item, index) => {
      return (
        <div key={index} className='resource-list-item'>
          <div className='resource-list-item-box'>
            <img src={item.icon}></img>
          </div>
          <div className='resource-list-item-txt'>{item.title}</div>
        </div>
      );
    });
  }, [resourceLibType]);

  return (
    <div className='resource-wrap'>
      <div className='resource-lib'>
        <DirectoryTree
          defaultExpandAll
          onSelect={onResourceLibHandle}
          treeData={Resource_lib_tree}
        />
      </div>
      <div className='resource-list-box'>
        <div className='resource-list'>{renderResourceList}</div>
      </div>
    </div>
  );
};

export default Resource;
