import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, useCallback } from 'react-redux';
import { Table, Spin, Select } from 'antd';
import {
  EditableGeoJsonLayer,
  DrawPointMode,
  DrawLineStringMode,
  DrawPolygonMode,
  ModifyMode,
  ViewMode
} from 'nebula.gl';
import DeckGL from '@deck.gl/react';
import { PathLayer, IconLayer } from '@deck.gl/layers';
import { COORDINATE_SYSTEM } from '@deck.gl/core';
import { PathStyleExtension } from '@deck.gl/extensions';
import getDataFromXodr from '@/utils/getDataFromXodr';
import VehicleImg from '../../assets/images/vehicle.png';
import {
  getIconScale,
  formatIconDataFromFeatures,
  getBezierPointFromFeatures,
  CreateBezierPoints
} from './lib/utils';
import { createMapLayer, createCarIconLayer, createRouterLayer } from './lib/layers';
import './index.less';
const { Option } = Select;
let isDropEnd = false; //拖动到map 的flag
const MapEdit = () => {
  //可编辑的 Feature   Indexes
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([]);
  const [featuresCollection, setFeaturesCollection] = useState({
    type: 'FeatureCollection',
    features: []
  });

  const [mode, setMode] = useState(() => ViewMode);
  const [mapZoom, setMapZoom] = useState(15);
  const [viewState, useViewState] = useState({});

  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState({ solidLines: [], brokenLines: [] });
  const getData = async () => {
    setLoading(true);
    const result = await getDataFromXodr('download/multi_intersections.xodr');
    setLoading(false);
    setMapData(result);
  };
  useEffect(() => {
    const a = getData();
  }, []);
  //地图 事件
  const onEdit = ({ updatedData, editType, editContext }) => {
    if (editType === 'addTentativePosition') {
      // 加点
    }
    if (editType === 'addFeature') {
      // 加特征
    }
    if (editType === 'finishMovePosition') {
      // 移动完成
    }
    if (editType === 'updateTentativeFeature') {
      // 移动中
      if (isDropEnd) {
        // 刚拖动完的第一个移动事件
        isDropEnd = false;
        setFeaturesCollection((prevState) => {
          console.log(prevState);
          return {
            type: 'FeatureCollection',
            features: [
              ...prevState.features,
              {
                type: 'Feature',
                properties: {},
                geometry: { type: 'Point', coordinates: editContext.feature.geometry.coordinates }
              }
            ]
          };
        });

        const updatedSelectedFeatureIndexes = [
          ...selectedFeatureIndexes,
          selectedFeatureIndexes.length
        ];
        setSelectedFeatureIndexes(updatedSelectedFeatureIndexes);
      }
    }
    console.log(updatedData);
    console.log(editType);
    console.log(editContext);

    const { featureIndexes } = editContext;
    if (featureIndexes) {
      const updatedSelectedFeatureIndexes = [...selectedFeatureIndexes, ...featureIndexes];
      setFeaturesCollection(updatedData);
      setSelectedFeatureIndexes(updatedSelectedFeatureIndexes);
    }
  };
  //------------------------------图层创建--------------------------------
  //地图
  const layers = createMapLayer(mapData);
  //可编辑图层
  const editableGeoJsonLayer = new EditableGeoJsonLayer({
    id: 'geojson-layer',
    data: featuresCollection,
    selectedFeatureIndexes,
    pointRadiusMinPixels: 8, //点的大小
    getFillColor: [255, 0, 0], //点 和 多边形的填充颜色
    getLineColor: [0, 0, 255], // 线的颜色
    mode: mode,
    onEdit
  });
  layers.push(editableGeoJsonLayer);
  //汽车绘画
  const iconLayerData = formatIconDataFromFeatures(featuresCollection);
  const iconLayers = createCarIconLayer('car-layer', iconLayerData, mapZoom);
  layers.push(iconLayers);
  // //拖动的汽车绘画
  // const dropCarLayers = createCarIconLayer('drop-car-layer', dropCar, mapZoom);
  // layers.push(dropCarLayers);

  //贝塞尔曲线绘画
  const points = getBezierPointFromFeatures(featuresCollection);
  const routerData = points.map((item, index) => {
    return {
      name: 'router' + index,
      path: item
    };
  });
  const routerLayers = createRouterLayer('route-layer', routerData);
  layers.push(routerLayers);

  //------------------------------事件监听--------------------------------
  //map  视图变化
  const onViewStateChange = ({ viewState }) => {
    // console.log(viewState);
    setMapZoom(viewState.zoom);
    // useViewState(viewState);
  };
  //map  模式变化
  const handleMapModeChange = (value) => {
    if (value === 'view') {
      setMode(() => ViewMode);
    }
    if (value === 'point') {
      setMode(() => DrawPointMode);
    }
    if (value === 'line') {
      setMode(() => DrawLineStringMode);
    }
    if (value === 'polygon') {
      setMode(() => DrawPolygonMode);
    }
    if (value === 'eidt') {
      setMode(() => ModifyMode);
    }
  };

  //车辆拖动结束事件
  const dragEnd = (e) => {
    console.log(e);
  };
  //阻止默认事件才能触发drop
  const dragEnterHandle = (e) => {
    e.preventDefault();
  };
  const dragOverHandle = (e) => {
    e.preventDefault();
  };
  //车辆拖动  到 map 事件
  const dropHandle = (e) => {
    console.log('drag target');
    isDropEnd = true;
  };

  //ViewState 会锁死视图  initialViewState 初始化视图
  return (
    <div className='map-edit-wrap'>
      <div className='map-box-wrap'>
        {loading ? (
          <span className='spin-wrap'>
            <Spin />
          </span>
        ) : (
          <div
            className='map-box'
            onDragOver={dragOverHandle}
            onDragEnter={dragEnterHandle}
            onDrop={dropHandle}
          >
            <DeckGL
              initialViewState={{
                latitude: 0,
                longitude: 0,
                zoom: 15,
                minZoom: 10,
                maxZoom: 20,
                bearing: 0
              }}
              onViewStateChange={onViewStateChange}
              layers={layers}
              controller={{ doubleClickZoom: false }}
            ></DeckGL>
          </div>
        )}
      </div>
      <div className='control-wrap'>
        <div>
          <Select defaultValue='view' style={{ width: 120 }} onChange={handleMapModeChange}>
            ViewMode
            <Option value='view'>查看</Option>
            <Option value='point'>点</Option>
            <Option value='line'>线</Option>
            <Option value='polygon'>多边形</Option>
            <Option value='eidt'>编辑</Option>
          </Select>
        </div>
        <div>
          <img
            style={{
              width: '100px',
              height: '50px',
              display: 'inline-block',
              border: '1px solid red'
            }}
            draggable
            onDragEnd={dragEnd}
            src={VehicleImg}
          ></img>
        </div>
      </div>
    </div>
  );
};

export default MapEdit;
