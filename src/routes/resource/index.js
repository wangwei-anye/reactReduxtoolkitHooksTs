import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Tree, Button, message, Modal, Progress } from 'antd';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Resource_lib_tree,
  RESOURCE_TYPE,
  Resource_list_main_car,
  Resource_list_element_car,
  Resource_list_element_people,
  Resource_list_element_bicycle,
  Resource_list_triggers,
  Resource_list_element_animal,
  Resource_traffic_flow
} from '../mapEdit/lib/constant';
import DeckGL from '@deck.gl/react';
import { createMapLayer } from '../mapEdit/lib/layers';
import getDataFromXodr from '@/utils/getDataFromXodr';
import { dataURLtoFile } from '@/utils/tools';
import { uploadMap, getMapListApi, deleteMap } from '@/services/resource';
import { upload as uploadFile } from '@/services/file';
import { ASSERT_SERVE } from '@/constants';
import { GPS } from '../mapEdit/lib/GPS';

import './index.less';

const { DirectoryTree } = Tree;

let xodr_uploadFiles = [];
let xodr_uploadIndex = 0;
let xodr_uploadTotal = 0;
let input_target;

const Resource = () => {
  //切换资源库类型
  const [resourceLibType, setResourceLibType] = useState(RESOURCE_TYPE.MAP);
  const [layers, setLayers] = useState([]);
  const [centerPoint, setCenterPoint] = useState([0, 0]);
  const [mapLen, setMapLen] = useState(800);
  const [uploadData, setUploadData] = useState();
  const [mapData, setMapData] = useState([]);
  const [selectMap, setSelectMap] = useState({ id: 0, readOnly: 1 });

  const [uploadIndex, setUploadIndex] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadMoadlVisible, setUploadMoadlVisible] = useState(false);

  const deckRef = useRef();

  useEffect(() => {
    getMapData();
  }, []);

  const getMapData = async () => {
    const { data } = await getMapListApi({
      menuIds: '1495942761243193349',
      current: 1,
      size: 1000
    });
    if (data.code === 200) {
      const result = [];
      for (let i = 0; i < data.data.records.length; i++) {
        result.push({
          id: data.data.records[i].id,
          title: data.data.records[i].name,
          icon: ASSERT_SERVE + data.data.records[i].iconUrl,
          readOnly: data.data.records[i].readOnly,
          active: false
        });
      }
      setMapData(result);
    }
  };

  // 资源库切换
  const onResourceLibHandle = (keys) => {
    setResourceLibType(keys[0]);
  };

  //文件库
  const renderResourceList = useMemo(() => {
    let Resource_list = [];
    if (resourceLibType === RESOURCE_TYPE.MAP) {
      Resource_list = mapData;
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
    } else if (resourceLibType === RESOURCE_TYPE.TRAFFIC_FLOW) {
      Resource_list = Resource_traffic_flow;
    }

    return Resource_list.map((item, index) => {
      return (
        <div
          key={index}
          className={['resource-list-item', item.active ? 'active' : 'no_active'].join(' ')}
          onClick={() => {
            selectElement(index);
          }}
        >
          <div className='resource-list-item-box'>
            <img src={item.icon}></img>
          </div>
          <div className='resource-list-item-txt'>{item.title}</div>
        </div>
      );
    });
  }, [resourceLibType, mapData]);

  const selectElement = (index) => {
    if (resourceLibType === RESOURCE_TYPE.MAP) {
      setMapData((prevState) => {
        for (let i = 0; i < prevState.length; i++) {
          prevState[i].active = false;
        }
        prevState[index].active = true;
        return [...prevState];
      });
    }
    setSelectMap(mapData[index]);
  };

  const refUpload = useRef();
  const importHandle = () => {
    refUpload.current.click();
  };

  const isMapExist = (name) => {
    for (let i = 0; i < mapData.length; i++) {
      if (mapData[i].title === name) {
        return true;
      }
    }
    return false;
  };

  const uploadHandle = async (e) => {
    input_target = e.target;
    const filesNoExist = [];
    for (let i = e.target.files.length - 1; i >= 0; i--) {
      if (!isMapExist(e.target.files[i].name)) {
        filesNoExist.push(e.target.files[i]);
      }
    }
    if (filesNoExist.length > 0) {
      setUploadIndex(0);
      setUploadTotal(filesNoExist.length);
      xodr_uploadIndex = 0;
      xodr_uploadTotal = filesNoExist.length;
      xodr_uploadFiles = filesNoExist;
      setUploadMoadlVisible(true);
      uploadXoscHandle();
    } else {
      message.success('文件已存在!');
    }
  };
  //批量上传XODR
  const uploadXoscHandle = async () => {
    if (xodr_uploadIndex >= xodr_uploadTotal) {
      getMapData();
      setUploadMoadlVisible(false);
      input_target.value = '';
      return;
    }
    uploadXoscItemHandle(xodr_uploadFiles[xodr_uploadIndex]);
  };

  const uploadXoscItemHandle = async (file) => {
    const formData = new FormData();
    formData.append('menuId', '1495942761243193349');
    formData.append('name', file.name);
    formData.append('tags', '');
    formData.append('remark', '');
    formData.append('file', file);
    setUploadData(formData);
    initMap(file);
  };

  const screenshot = async () => {
    if (layers.length === 0) {
      return;
    }
    //重新渲染 不然截图 白屏
    deckRef.current.deck.redraw(true);
    const canvas = document.getElementById('deckgl-overlay');
    const imgBlobData = canvas.toDataURL('image/png', 0.2);
    const fileUrl = dataURLtoFile(imgBlobData, 'map', 'image/png');
    const formData = new FormData();
    formData.append('name', 'map');
    formData.append('type', 'png');
    formData.append('file', fileUrl);
    const { data } = await uploadFile(formData);
    if (data.code === 200) {
      uploadData.append('iconUrl', data.data.url);
      const { data: result } = await uploadMap(uploadData);

      xodr_uploadIndex++;
      setUploadIndex(xodr_uploadIndex);
      uploadXoscHandle();

      // if (result.code === 200) {
      //   message.success('导入成功!');
      //   getMapData();
      // }
    }
  };

  const initMap = async (file) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = async (e) => {
      let data = e.target.result;
      const result = await getDataFromXodr(data, 2);
      const layer = createMapLayer(result);
      setLayers([layer]);
      calcMapCenterPoint(result.referenceLines);
    };
  };
  //计算地图中心点  和 渲染宽高
  const calcMapCenterPoint = (referenceLines) => {
    let totalX = 0;
    let totalY = 0;
    let totalNum = 0;
    for (let i = 0; i < referenceLines.length; i++) {
      for (let j = 0; j < referenceLines[i].path.length; j++) {
        totalX += referenceLines[i].path[j][0];
        totalY += referenceLines[i].path[j][1];
        totalNum++;
      }
    }
    const centerX = totalX / totalNum;
    const centerY = totalY / totalNum;
    let maxLen = 0;
    for (let i = 0; i < referenceLines.length; i++) {
      for (let j = 0; j < referenceLines[i].path.length; j++) {
        let tempLen =
          Math.abs(centerX - referenceLines[i].path[j][0]) *
            Math.abs(centerX - referenceLines[i].path[j][0]) +
          Math.abs(centerY - referenceLines[i].path[j][1]) *
            Math.abs(centerY - referenceLines[i].path[j][1]);
        if (tempLen > 0) {
          tempLen = Math.sqrt(tempLen);
        }
        if (tempLen > maxLen) {
          maxLen = tempLen;
        }
      }
    }
    maxLen = maxLen * 2;
    if (maxLen > 2000) {
      maxLen = 2000;
    }
    if (maxLen < 500) {
      maxLen = 500;
    }
    setMapLen(maxLen);
    setCenterPoint([centerX, centerY]);
  };

  useEffect(() => {
    setTimeout(() => {
      screenshot();
    }, 0);
  }, [layers]);

  const deleteHandle = async () => {
    const { data } = await deleteMap({
      ids: selectMap.id
    });

    if (data.code === 200) {
      message.success('删除成功!');
      getMapData();
    }
  };

  const pos = GPS.mercator_decrypt(centerPoint[0], centerPoint[1]);

  const progressNum = useMemo(() => {
    return parseInt((uploadIndex / uploadTotal) * 100);
  }, [uploadIndex]);

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
        {resourceLibType === RESOURCE_TYPE.MAP ? (
          <div className='menu-box'>
            <div className='item-list'>
              <div className='item' onClick={importHandle}>
                <Button type='primary' icon={<DownloadOutlined />} size={20}></Button>
                <div>导入</div>
              </div>
              <div className='item'>
                <Button
                  disabled={selectMap.readOnly === 1 ? true : false}
                  type='primary'
                  onClick={deleteHandle}
                  icon={<DeleteOutlined />}
                  size={20}
                ></Button>
                <div>删除</div>
              </div>
              <input
                ref={refUpload}
                style={{ display: 'none' }}
                onChange={uploadHandle}
                accept='.xodr'
                type='file'
                multiple={true}
              ></input>
            </div>
          </div>
        ) : null}

        <div className='resource-list'>{renderResourceList}</div>
      </div>
      <div>
        <div className='map-box-wrap' style={{ width: mapLen, height: mapLen }}>
          <div className='map-box' id='map-box'>
            <DeckGL
              ref={deckRef}
              initialViewState={{
                longitude: pos.lon,
                latitude: pos.lat,
                zoom: 16.5,
                minZoom: 16.5,
                maxZoom: 16.5,
                bearing: 0
              }}
              parameters={{
                // clearColor: [0.15, 0.6, 0.15, 1]
                clearColor: [0.86, 0.86, 0.86, 1]
              }}
              layers={layers}
              controller={false}
            ></DeckGL>
          </div>
        </div>
      </div>
      <Modal title='上传进度' className='upload-xodr-modal' visible={uploadMoadlVisible} footer=''>
        <Progress percent={progressNum} />
      </Modal>
    </div>
  );
};

export default Resource;
