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
import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import { PathStyleExtension } from '@deck.gl/extensions';
import getDataFromXodr from '@/utils/getDataFromXodr';
import VehicleImg from '../../assets/images/vehicle.png';
import {
  getIconScale,
  formatIconDataFromFeatures,
  getBezierPointFromFeatures,
  CreateBezierPoints
} from './lib/utils';
import './index.less';
const { Option } = Select;

const MapEdit = () => {
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
    const result = await getDataFromXodr();
    setLoading(false);
    setMapData(result);
  };
  useEffect(() => {
    const a = getData();
  }, []);

  const onEdit = ({ updatedData, editType, editContext }) => {
    console.log(updatedData);
    console.log(editType);
    console.log(editContext);
    if (editType === 'addTentativePosition') {
      // 加点
    }
    if (editType === 'addFeature') {
      // 加特征
    }
    if (editType === 'finishMovePosition') {
      // 移动完成
    }

    const { featureIndexes } = editContext;
    if (featureIndexes) {
      const updatedSelectedFeatureIndexes = [...selectedFeatureIndexes, ...featureIndexes];
      console.log(updatedData);
      setFeaturesCollection(updatedData);
      setSelectedFeatureIndexes(updatedSelectedFeatureIndexes);
    }
  };

  const renderLayer = (mapData) => {
    if (!mapData) {
      return [];
    }
    const temp1 = new PathLayer({
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [0, 0, 0],
      id: 'path-layer-solid',
      widthUnits: 'pixels',
      rounded: true,
      data: mapData.solidLines,
      getColor: (d) => [255, 0, 0],
      getTooltip: (e) => {
        return '1111111';
      }
    });
    const temp2 = new PathLayer({
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [0, 0, 0],
      id: 'path-layer-broken',
      widthUnits: 'pixels',
      rounded: true,
      data: mapData.brokenLines,
      getColor: (d) => [0, 0, 255],
      getDashArray: [80, 180], //虚线   实线/总长度
      dashJustified: true,
      extensions: [new PathStyleExtension({ dash: true, highPrecisionDash: true })]
    });
    let layers = [temp1, temp2];
    return layers;
  };
  const layers = renderLayer(mapData);

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

  //汽车绘画
  const iconLayerData = formatIconDataFromFeatures(featuresCollection);
  const ICON_MAPPING = {
    // 类似css 里的 background-image:position  width
    marker: { x: 0, y: 0, width: 200, height: 99, mask: false },
    marker2: { x: 0, y: 0, width: 200, height: 99, mask: false }
  };
  const iconLayers = new IconLayer({
    id: 'icon-layer',
    pickable: true,
    data: iconLayerData,
    iconAtlas: VehicleImg,
    iconMapping: ICON_MAPPING,
    getIcon: (d) => {
      if (d.id === 1) {
        return 'marker';
      }
      return 'marker2';
    },
    sizeUnits: 'pixels',
    sizeScale: getIconScale(mapZoom),
    getPosition: (d) => d.coordinates,
    getSize: (d) => 5,
    getAngle: (d) => d.angle
  });

  //贝塞尔曲线绘画
  const points = getBezierPointFromFeatures(featuresCollection);
  const routerData = points.map((item, index) => {
    return {
      name: 'router' + index,
      path: item
    };
  });

  const routerLayers = new PathLayer({
    id: 'route-layer',
    data: routerData,
    widthUnits: 'pixels',
    rounded: true,
    opacity: 0.8,
    getWidth: (d) => 10,
    getColor: (d) => [0, 255, 0],
    getPath: (d) => d.path
  });
  //添加图层
  layers.push(editableGeoJsonLayer);
  layers.push(iconLayers);
  layers.push(routerLayers);

  const onViewStateChange = ({ viewState }) => {
    // console.log(viewState);
    setMapZoom(viewState.zoom);
    // useViewState(viewState);
  };

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

  //ViewState 会锁死视图  initialViewState 初始化视图
  return (
    <div className='map-edit-wrap'>
      <div className='map-box-wrap'>
        {loading ? (
          <span className='spin-wrap'>
            <Spin />
          </span>
        ) : (
          <div className='map-box'>
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
        <Select defaultValue='view' style={{ width: 120 }} onChange={handleMapModeChange}>
          ViewMode
          <Option value='view'>查看</Option>
          <Option value='point'>点</Option>
          <Option value='line'>线</Option>
          <Option value='polygon'>多边形</Option>
          <Option value='eidt'>编辑</Option>
        </Select>
      </div>
    </div>
  );
};

export default MapEdit;
