import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Tree,
  Spin,
  Select,
  Tooltip,
  InputNumber,
  Popconfirm,
  Switch,
  message,
  Modal,
  Button,
  Slider
} from 'antd';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  LoginOutlined
} from '@ant-design/icons';
import {
  EditableGeoJsonLayer,
  DrawPointMode,
  DrawLineStringMode,
  ModifyMode,
  RotateMode,
  DrawRectangleMode,
  ViewMode,
  TranslateMode,
  ScaleMode,
  ExtrudeMode,
  CompositeMode
} from 'nebula.gl';
import YAML from 'yaml';
import DeckGL from '@deck.gl/react';
import getDataFromXodr from '@/utils/getDataFromXodr';
import { GPS } from './lib/GPS';
import {
  formatIconDataFromInfo,
  formatIconDataFromElementInfo,
  getBezierPointFromFeatures,
  createRectangle,
  calcRectangle,
  calcMinDistancePoint,
  getTotalLenByPoint,
  createRotatePoint,
  getAngleByTwoPoint,
  getPointByRouterAndTime,
  isInTrigger
} from './lib/utils';
import getTrajectory from '@/utils/getTrajectory';
import { saveApi, updateApi } from '@/services/mapEdit';
import { getAlgorithm } from '@/services/caseLib';
import { createTaskApi } from '@/services/task';
import { getMapListApi } from '@/services/resource';
import { ASSERT_SERVE } from '@/constants';
import { createMapLayer, createCarIconLayer, createRouterLayer } from './lib/layers';
import {
  Resource_lib_tree,
  RESOURCE_TYPE,
  Resource_list_main_car,
  Resource_list_element_car,
  Resource_list_element_people,
  Resource_list_element_animal,
  Resource_list_element_bicycle,
  Resource_list_triggers,
  Resource_traffic_flow
} from './lib/constant';
import './index.less';
const { Option } = Select;
const { DirectoryTree } = Tree;
const translateAndScaleMode = new CompositeMode([
  new TranslateMode(),
  new ScaleMode(),
  new ExtrudeMode()
]);
const translateAndRotateMode = new CompositeMode([new TranslateMode(), new RotateMode()]);
let drag_type = ''; //????????? ????????????
let isDropEnd = false; //?????????map ???flag
let createElementId = 1; //??????ID ???????????????????????? ??????1
let lastFileLen = 0; //?????????????????????????????? ????????????????????????????????????????????????????????????????????????????????????
let playFrame = 0;
let playInterval;
let playStartTrigger = {}; //????????????????????????  { id :  ???????????? }
let lastSaveYaml = ''; //??????????????????yaml  ?????????????????????????????????
let isCreateTask = false; //?????????????????????????????????
const MapEdit = () => {
  //???????????? Feature   Indexes
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState([0]);
  const [featuresCollection, setFeaturesCollection] = useState({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          elementId: '',
          index: '',
          type: RESOURCE_TYPE.ROTATE_POINT
        },
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        }
      }
    ]
  });
  // ????????????  ???  ??????????????????
  const [mode, setMode] = useState(() => ViewMode);
  const [modeValue, setModeValue] = useState('view');

  // ??????
  const [mapZoom, setMapZoom] = useState(18);
  const [viewState, useViewState] = useState({});
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState({
    solidLines: [],
    brokenLines: [],
    referenceLines: [],
    arrowLayer: []
  });
  //?????????????????????
  const [resourceLibType, setResourceLibType] = useState(RESOURCE_TYPE.MAP);
  //???????????????????????????
  const [resourceOperateType, setResourceOperateType] = useState(RESOURCE_TYPE.MAP);
  //?????????????????????ID
  const [currentElementId, setCurrentElementId] = useState();
  //?????????????????????Index
  const [currentElementIndex, setCurrentElementIndex] = useState();
  //??? ?????????????????? ????????????   defaultExpandAll ?????????
  const [renderFlag, setRenderFlag] = useState(true);
  //?????????????????? key
  const [resourceLoadTreeSelectKey, setResourceLoadTreeSelectKey] = useState([]);
  //???????????????
  const [mapListData, setMapListData] = useState([]);
  const [mapLoadInfo, setMapLoadInfo] = useState({});
  const [mainCarInfo, setMainCarInfo] = useState({}); //??????  ??????
  const [elementInfo, setElementInfo] = useState([]); //??????  ??????
  const [triggersInfo, setTriggersInfo] = useState([]); //??????  ??????
  const [routerData, setRouterData] = useState([]); //??????  ??????
  const [trafficFlowInfo, setTrafficFlowInfo] = useState({});

  //??????????????????
  const [isPlay, setIsPlay] = useState(false);
  //???????????????
  const [isPlaying, setIsPlaying] = useState(false);
  const [playData, setPlayData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [algorithmArr, setAlgorithmArr] = useState([]);
  const [algorithm, setAlgorithm] = useState();
  const [taskName, setTaskName] = useState();
  const [disabledBtn, setDisabledBtn] = useState(false);

  const inputEl = useRef(null);
  //--------------?????????----------------
  //???????????? FeatureCollection -> mainCarInfo???mapLoadInfo -> ??????????????????
  //--------------?????????----------------
  //????????????
  const setMapHandle = async (url) => {
    setLoading(true);
    try {
      const result = await getDataFromXodr(url);
      setLoading(false);
      setMapData(result);
    } catch (error) {}
  };
  //?????????
  useEffect(() => {
    getMapData();
  }, []);

  const getMapData = async () => {
    const { data } = await getMapListApi({
      menuIds: '1495942761243193349',
      current: 1,
      size: 1000
    });
    const result = [];
    if (data.code === 200) {
      for (let i = 0; i < data.data.records.length; i++) {
        result.push({
          title: data.data.records[i].name,
          key: data.data.records[i].id,
          url: data.data.records[i].mapFileUrl,
          icon: ASSERT_SERVE + data.data.records[i].iconUrl
        });
      }
      setMapListData(result);
    }
    //????????????????????? ???????????????
    if (localStorage.caseType === 'edit') {
      getFile(localStorage.caseData, result);
    } else {
      if (result.length > 0) {
        setMapLoadInfo(result[0]);
      } else {
        setMapLoadInfo({
          title: '',
          key: '',
          url: '',
          icon: ''
        });
      }
    }
  };

  const getFile = async (url, mapData) => {
    fetch(`${ASSERT_SERVE}${url}`, {
      cache: 'no-cache'
    })
      .then((file_data) => {
        return file_data.text();
      })
      .then((file_text) => {
        //??????FeatureCollection ??????  ?????? data ??????  ?????????????????? FeatureCollection -???data????????????Feature?????????data
        getDataFromYaml(file_text, mapData);
        setTimeout(() => {
          getDataFromYamlAsnyc(file_text);
        }, 2000);
      });
  };

  //???????????? ?????? ?????? ??????  ?????? ??????????????? ?????? ?????????
  const getDataFromCollectionAsync = async () => {
    const tempElementInfo = {};
    for (let i = 0; i < featuresCollection.features.length; i++) {
      if (featuresCollection.features[i].properties.type) {
        if (
          featuresCollection.features[i].properties.type !== RESOURCE_TYPE.TRIGGERS &&
          featuresCollection.features[i].properties.type !== RESOURCE_TYPE.ROTATE_POINT
          // featuresCollection.features[i].properties.elementId === currentElementId //??????????????????????????????
        ) {
          if (tempElementInfo[featuresCollection.features[i].properties.elementId]) {
            tempElementInfo[featuresCollection.features[i].properties.elementId].push({
              position: {
                x: featuresCollection.features[i].geometry.coordinates[0],
                y: featuresCollection.features[i].geometry.coordinates[1]
              },
              heading: featuresCollection.features[i].properties.heading || 0,
              velocity: featuresCollection.features[i].properties.velocity || 0,
              accelerate: featuresCollection.features[i].properties.accelerate || 0,
              time: featuresCollection.features[i].properties.time || 0,
              changeProp: featuresCollection.features[i].properties.changeProp || 'velocity'
            });
          } else {
            tempElementInfo[featuresCollection.features[i].properties.elementId] = [
              {
                position: {
                  x: featuresCollection.features[i].geometry.coordinates[0],
                  y: featuresCollection.features[i].geometry.coordinates[1]
                },
                heading: featuresCollection.features[i].properties.heading || 0,
                velocity: featuresCollection.features[i].properties.velocity || 0,
                accelerate: featuresCollection.features[i].properties.accelerate || 0,
                time: featuresCollection.features[i].properties.time || 0,
                changeProp: featuresCollection.features[i].properties.changeProp || 'velocity'
              }
            ];
          }
        }
      }
    }

    //????????????   ?????? ??? ??????
    for (var item in tempElementInfo) {
      const tempRouterArr = tempElementInfo[item];
      //?????? ??????  ???????????????
      if (tempRouterArr.length > 1) {
        for (let k = 0; k < tempRouterArr.length; k++) {
          const meters = GPS.mercator_encrypt(
            tempRouterArr[k].position.x,
            tempRouterArr[k].position.y
          );
          tempRouterArr[k].meters = meters;
        }
        for (let k = 1; k < tempRouterArr.length; k++) {
          const trajectotyArr = await getTrajectory([
            {
              x: tempRouterArr[k - 1].meters.x,
              y: tempRouterArr[k - 1].meters.y,
              heading: tempRouterArr[k - 1].heading
            },
            {
              x: tempRouterArr[k].meters.x,
              y: tempRouterArr[k].meters.y,
              heading: tempRouterArr[k].heading
            }
          ]);
          const totalLen = getTotalLenByPoint(trajectotyArr);
          tempRouterArr[k].totalLen = totalLen;
          if (tempRouterArr[k].changeProp === 'velocity') {
            const _vt = tempRouterArr[k].velocity / 3.6; //km/h  ?????????  m/s
            const _v0 = tempRouterArr[k - 1].velocity / 3.6;
            const _s = tempRouterArr[k].totalLen;
            const _t = _s / (_v0 + (_vt - _v0) / 2);
            tempRouterArr[k].time = _t + tempRouterArr[k - 1].time;
            tempRouterArr[k].accelerate = (_vt - _v0) / _t;
          }
          if (tempRouterArr[k].changeProp === 'time' && tempRouterArr[k].time > 0) {
            const _t = tempRouterArr[k].time - tempRouterArr[k - 1].time;
            const _v0 = tempRouterArr[k - 1].velocity / 3.6;
            const _s = tempRouterArr[k].totalLen;
            const _vt = _v0 + 2 * (_s / _t - _v0);
            tempRouterArr[k].velocity = _vt * 3.6;
            tempRouterArr[k].accelerate = (_vt - _v0) / _t;
          }
        }
      }
    }

    setElementInfo((prevState) => {
      for (let i = 0; i < prevState.length; i++) {
        if (tempElementInfo[prevState[i].id]) {
          const tempArr = tempElementInfo[prevState[i].id];
          for (let m = 0; m < prevState[i].routes.length; m++) {
            if (tempArr[m]) {
              prevState[i].routes[m].velocity = tempArr[m].velocity;
              prevState[i].routes[m].time = tempArr[m].time;
              prevState[i].routes[m].accelerate = tempArr[m].accelerate;
            }
          }
        }
      }
      return [...prevState];
    });
    setMainCarInfo((prevState) => {
      if (tempElementInfo[0]) {
        const tempArr = tempElementInfo[0];
        for (let m = 0; m < prevState.routes.length; m++) {
          if (tempArr[m]) {
            prevState.routes[m].velocity = tempArr[m].velocity;
            prevState.routes[m].time = tempArr[m].time;
            prevState.routes[m].accelerate = tempArr[m].accelerate;
          }
        }
      }
      return {
        ...prevState
      };
    });
  };
  //??????FeatureCollection ?????? mainCarInfo???elementInfo
  const getDataFromCollection = () => {
    const mainCarRoutes = [];
    const tempElementInfo = {};
    const triggerArr = [];

    for (let i = 0; i < featuresCollection.features.length; i++) {
      if (featuresCollection.features[i].properties.type) {
        if (featuresCollection.features[i].properties.type === RESOURCE_TYPE.MAIN_CAR) {
          mainCarRoutes.push({
            position: {
              x: featuresCollection.features[i].geometry.coordinates[0],
              y: featuresCollection.features[i].geometry.coordinates[1]
            },
            index: featuresCollection.features[i].properties.index || 0,
            heading: featuresCollection.features[i].properties.heading || 0,
            selected: featuresCollection.features[i].properties.selected || false,
            changeProp: featuresCollection.features[i].properties.changeProp || 'velocity'
          });
        } else if (featuresCollection.features[i].properties.type === RESOURCE_TYPE.TRIGGERS) {
          const obj = calcRectangle(featuresCollection.features[i].geometry.coordinates);
          let tempTriggeredId = [];
          for (let p = 0; p < triggersInfo.length; p++) {
            if (triggersInfo[p].id === featuresCollection.features[i].properties.elementId) {
              tempTriggeredId = triggersInfo[p].triggeredId;
              break;
            }
          }
          triggerArr.push(
            Object.assign({}, Resource_list_triggers[0], {
              id: featuresCollection.features[i].properties.elementId,
              pos: featuresCollection.features[i].geometry.coordinates,
              position: obj.position,
              size: obj.size,
              triggeredId: tempTriggeredId
            })
          );
        } else if (
          featuresCollection.features[i].properties.type !== RESOURCE_TYPE.ROTATE_POINT &&
          featuresCollection.features[i].properties.elementId === currentElementId
        ) {
          //????????????
          if (tempElementInfo[featuresCollection.features[i].properties.elementId]) {
            tempElementInfo[featuresCollection.features[i].properties.elementId].push({
              position: {
                x: featuresCollection.features[i].geometry.coordinates[0],
                y: featuresCollection.features[i].geometry.coordinates[1]
              },
              heading: featuresCollection.features[i].properties.heading || 0,
              index: featuresCollection.features[i].properties.index || 0,
              selected: featuresCollection.features[i].properties.selected || false,
              changeProp: featuresCollection.features[i].properties.changeProp || 'velocity'
            });
          } else {
            tempElementInfo[featuresCollection.features[i].properties.elementId] = [
              {
                position: {
                  x: featuresCollection.features[i].geometry.coordinates[0],
                  y: featuresCollection.features[i].geometry.coordinates[1]
                },
                heading: featuresCollection.features[i].properties.heading || 0,
                index: featuresCollection.features[i].properties.index || 0,
                changeProp: featuresCollection.features[i].properties.changeProp || 'velocity',
                selected: featuresCollection.features[i].properties.selected || false
              }
            ];
          }
        }
      }
    }
    setTriggersInfo(triggerArr);
    setElementInfo((prevState) => {
      for (let i = 0; i < prevState.length; i++) {
        if (tempElementInfo[prevState[i].id]) {
          prevState[i].routes = tempElementInfo[prevState[i].id];
        } else {
          //????????????????????? ????????????????????????
          for (let j = 0; j < prevState[i].routes.length; j++) {
            prevState[i].routes[j].selected = false;
          }
        }
      }
      return [...prevState];
    });
    //???????????????  heading ??? 0
    // if (mainCarRoutes.length > 1) {
    //   mainCarRoutes[mainCarRoutes.length - 1].heading = 0;
    // }
    setMainCarInfo((prevState) => {
      return {
        ...prevState,
        routes: mainCarRoutes
      };
    });
  };
  //???features ?????? ??????
  useEffect(() => {
    getDataFromCollection();
    //??????
    const timer = setTimeout(() => {
      getDataFromCollectionAsync();
    }, 200);
    return () => {
      clearTimeout(timer);
    };
  }, [featuresCollection]);

  //?????????????????????
  useEffect(() => {
    if (mapLoadInfo.url) {
      setMapHandle(mapLoadInfo.url);
    }
  }, [mapLoadInfo]);
  //?????????????????? ????????????
  const setModeHandle = (type) => {
    if (type === RESOURCE_TYPE.TRIGGERS) {
      setMode(() => translateAndScaleMode);
      setModeValue('translateAndscale');
    } else {
      setModeValue('edit');
      setMode(() => ModifyMode);
    }
  };
  //????????????????????????  selectId > 0 ?????????????????????
  const setSelectIndexHandle = (
    type,
    selectId,
    id = currentElementId,
    index = currentElementIndex
  ) => {
    //????????????????????????
    const updatedSelectedFeatureIndexes = [];
    if (type !== RESOURCE_TYPE.TRIGGERS) {
      for (let i = 0; i < featuresCollection.features.length; i++) {
        if (featuresCollection.features[i].properties.type === RESOURCE_TYPE.ROTATE_POINT) {
          updatedSelectedFeatureIndexes.push(i);
        }
      }
    }
    if (selectId >= 0) {
      updatedSelectedFeatureIndexes.push(selectId);
      setSelectedFeatureIndexes(updatedSelectedFeatureIndexes);
      return;
    }
    for (let i = 0; i < featuresCollection.features.length; i++) {
      if (
        featuresCollection.features[i].properties.elementId === id &&
        featuresCollection.features[i].properties.index === index
      ) {
        updatedSelectedFeatureIndexes.push(i);
      }
    }
    setSelectedFeatureIndexes(updatedSelectedFeatureIndexes);
  };

  //??????????????????????????????  ?????? ??????????????????
  const setRotatePointToFeatrue = (id = currentElementId, index = currentElementIndex) => {
    setFeaturesCollection((prevState) => {
      let originPoint;
      for (let i = 0; i < prevState.features.length; i++) {
        if (
          prevState.features[i].properties.elementId === id &&
          prevState.features[i].properties.index === index &&
          prevState.features[i].properties.type !== RESOURCE_TYPE.TRIGGERS &&
          prevState.features[i].properties.type !== RESOURCE_TYPE.ROTATE_POINT
        ) {
          originPoint = prevState.features[i];
          prevState.features[i].properties.selected = true;
        } else {
          prevState.features[i].properties.selected = false;
        }
      }
      for (let i = 0; i < prevState.features.length; i++) {
        if (
          originPoint &&
          originPoint.geometry &&
          originPoint.geometry.coordinates.length === 2 &&
          prevState.features[i].properties.type === RESOURCE_TYPE.ROTATE_POINT
        ) {
          prevState.features[i].geometry.coordinates = createRotatePoint(
            originPoint.geometry.coordinates,
            originPoint.properties.heading,
            originPoint.properties.type
          );
          prevState.features[i].properties.elementId = id;
          prevState.features[i].properties.index = index;
        }
      }
      return {
        type: 'FeatureCollection',
        features: [...prevState.features]
      };
    });
  };

  //??????????????????
  const clickCallback = (type, id, index = 0) => {
    if (isPlay) return;
    setResourceLoadTreeSelectKey([id]);
    setResourceOperateType(type);
    setModeHandle(type);
    setCurrentElementId(id);
    setCurrentElementIndex(index);
    setSelectIndexHandle(type, -1, id, index);
    setRotatePointToFeatrue(id, index);
  };

  //??????????????? ??????
  const onEdit = ({ updatedData, editType, editContext }) => {
    if (isPlay) return;
    //??????????????? ???  ???????????? ?????????
    if (resourceOperateType === RESOURCE_TYPE.TRIGGERS) {
      if (editType === 'removePosition' || editType === 'addPosition') {
        return;
      }
    }
    //???????????? ????????????
    if (
      drag_type !== RESOURCE_TYPE.MAIN_CAR &&
      drag_type !== RESOURCE_TYPE.ELEMENT_CAR &&
      drag_type !== RESOURCE_TYPE.ELEMENT_PEOPLE &&
      drag_type !== RESOURCE_TYPE.ELEMENT_ANIMAL &&
      drag_type !== RESOURCE_TYPE.ELEMENT_BICYCLE &&
      drag_type !== RESOURCE_TYPE.TRIGGERS &&
      editType === 'updateTentativeFeature'
    ) {
      return;
    }
    if (editType === 'addFeature') {
      // ?????????
    }
    if (editType === 'finishMovePosition') {
      // ??????????????? ????????????
    }
    if (mode === DrawPointMode) {
      if (editType === 'addTentativePosition') {
        // ??????
      }

      if (editType === 'updateTentativeFeature') {
        // ?????????
        if (
          drag_type === RESOURCE_TYPE.MAIN_CAR ||
          drag_type === RESOURCE_TYPE.ELEMENT_CAR ||
          drag_type === RESOURCE_TYPE.ELEMENT_PEOPLE ||
          drag_type === RESOURCE_TYPE.ELEMENT_ANIMAL ||
          drag_type === RESOURCE_TYPE.ELEMENT_BICYCLE ||
          drag_type === RESOURCE_TYPE.TRIGGERS
        ) {
          if (isDropEnd) {
            // ????????????????????????????????????
            isDropEnd = false;
            // if (drag_type === RESOURCE_TYPE.MAIN_CAR && mainCarInfo.routes.length >= 1) {
            //   return;
            // }
            //????????????
            addNewElement(drag_type, editContext.feature.geometry.coordinates, true);
            return;
          }
        }
      }
    }
    //????????????
    const { featureIndexes } = editContext;
    if (featureIndexes) {
      if (editType === 'finishMovePosition') {
        //???????????????????????? ????????????
        if (
          updatedData.features[featureIndexes].properties.type === RESOURCE_TYPE.MAIN_CAR ||
          updatedData.features[featureIndexes].properties.type === RESOURCE_TYPE.ELEMENT_CAR
        ) {
          const calcResult = calcMinDistancePoint(
            updatedData.features[featureIndexes].geometry.coordinates,
            mapData.referenceLines
          );
          if (calcResult[2]) {
            updatedData.features[featureIndexes].geometry.coordinates = calcResult[0];
            updatedData.features[featureIndexes].properties.heading = calcResult[1];
          }
        }
      }
      //????????????
      if (updatedData.features[featureIndexes].properties.type === RESOURCE_TYPE.ROTATE_POINT) {
        let tempId;
        let tempIndex;
        let rotatePoint = [];
        for (let i = 0; i < updatedData.features.length; i++) {
          if (updatedData.features[i].properties.type === RESOURCE_TYPE.ROTATE_POINT) {
            tempId = updatedData.features[i].properties.elementId;
            tempIndex = updatedData.features[i].properties.index;
            rotatePoint = updatedData.features[i].geometry.coordinates;
            break;
          }
        }
        for (let i = 0; i < updatedData.features.length; i++) {
          if (
            updatedData.features[i].properties.elementId === tempId &&
            updatedData.features[i].properties.index === tempIndex &&
            updatedData.features[i].properties.type !== RESOURCE_TYPE.ROTATE_POINT
          ) {
            const meters = GPS.mercator_encrypt(
              updatedData.features[i].geometry.coordinates[0],
              updatedData.features[i].geometry.coordinates[1]
            );
            const rotatePointMeters = GPS.mercator_encrypt(rotatePoint[0], rotatePoint[1]);
            const heading = getAngleByTwoPoint(
              [meters.x, meters.y],
              [rotatePointMeters.x, rotatePointMeters.y]
            );
            updatedData.features[i].properties.heading = heading;
          }
        }
      }
      if (editType === 'finishMovePosition') {
        setTimeout(() => {
          setRotatePointToFeatrue();
        }, 300);
      }
      setFeaturesCollection(updatedData);
    }
  };
  //isNewElement  ??????????????????????????????????????????
  const addNewElement = (type, coordinates, isNewElement = false) => {
    let heading = 0;
    let calcResult = [];
    //?????? ????????????
    if (type === RESOURCE_TYPE.MAIN_CAR || type === RESOURCE_TYPE.ELEMENT_CAR) {
      calcResult = calcMinDistancePoint(coordinates, mapData.referenceLines);
      if (calcResult[2]) {
        coordinates = calcResult[0];
        heading = calcResult[1];
      }
    }

    let lenIndex;
    let elementId;
    if (isNewElement) {
      if (type !== RESOURCE_TYPE.MAIN_CAR) {
        elementId = createElementId;
        createElementId++;
      } else {
        elementId = 0;
      }
      lenIndex = 0;
      if (type === RESOURCE_TYPE.MAIN_CAR) {
        setMainCarInfo(Resource_list_main_car[0]);
      } else if (type === RESOURCE_TYPE.ELEMENT_CAR) {
        setElementInfo((prevState) => {
          return [...prevState, Object.assign({}, Resource_list_element_car[0], { id: elementId })];
        });
      } else if (type === RESOURCE_TYPE.ELEMENT_PEOPLE) {
        setElementInfo((prevState) => {
          return [
            ...prevState,
            Object.assign({}, Resource_list_element_people[0], { id: elementId })
          ];
        });
      } else if (type === RESOURCE_TYPE.ELEMENT_ANIMAL) {
        setElementInfo((prevState) => {
          return [
            ...prevState,
            Object.assign({}, Resource_list_element_animal[0], { id: elementId })
          ];
        });
      } else if (type === RESOURCE_TYPE.ELEMENT_BICYCLE) {
        setElementInfo((prevState) => {
          return [
            ...prevState,
            Object.assign({}, Resource_list_element_bicycle[0], { id: elementId })
          ];
        });
      } else if (type === RESOURCE_TYPE.TRIGGERS) {
        setTriggersInfo((prevState) => {
          return [...prevState, Object.assign({}, Resource_list_triggers[0], { id: elementId })];
        });
      }
    } else {
      elementId = currentElementId;
      if (type === RESOURCE_TYPE.MAIN_CAR) {
        lenIndex = mainCarInfo.routes.length;
      } else {
        for (let i = 0; i < elementInfo.length; i++) {
          if (elementInfo[i].id === elementId) {
            lenIndex = elementInfo[i].routes.length;
          }
        }
      }
    }
    setResourceOperateType(type);
    setCurrentElementId(elementId);
    setModeHandle(type);
    setResourceLoadTreeSelectKey([elementId]);
    setCurrentElementIndex(lenIndex);
    //?????????????????????????????????
    setSelectIndexHandle(type, featuresCollection.features.length);

    if (type === RESOURCE_TYPE.TRIGGERS) {
      const coordinatesArr = createRectangle(coordinates, Resource_list_triggers[0].size);
      setFeaturesCollection((prevState) => {
        return {
          type: 'FeatureCollection',
          features: [
            ...prevState.features,
            {
              type: 'Feature',
              properties: {
                shape: 'Rectangle',
                type,
                heading: 0,
                index: lenIndex,
                selected: false,
                elementId,
                coordinates,
                size: Resource_list_triggers[0].size
              },
              geometry: {
                type: 'Polygon',
                coordinates: [coordinatesArr]
              }
            }
          ]
        };
      });
    } else {
      setFeaturesCollection((prevState) => {
        return {
          type: 'FeatureCollection',
          features: [
            ...prevState.features,
            {
              type: 'Feature',
              properties: {
                type,
                heading: heading,
                index: lenIndex,
                elementId,
                selected: false,
                //????????????36km/s
                changeProp: 'velocity',
                velocity: isNewElement ? 0 : 36
              },
              geometry: {
                type: 'Point',
                coordinates: coordinates
              }
            }
          ]
        };
      });
    }
    setRotatePointToFeatrue(elementId, lenIndex);
  };
  //------------------------------????????????--------------------------------
  const getLineColor = (feature, isSelected) => {
    if (feature.properties.type === RESOURCE_TYPE.TRIGGERS) {
      return [255, 0, 0, 255];
    } else if (feature.properties.type === RESOURCE_TYPE.ROTATE_POINT) {
      return [255, 0, 0, 0];
    } else {
      return [0, 255, 0, 0];
    }
  };

  const getEditHandlePointOutlineColor = (feature, isSelected) => {
    return [0, 0, 255, 0];
  };

  const getEditHandlePointColor = (feature, isSelected) => {
    return [0, 0, 255, 0];
  };

  const playHandle = () => {
    setIsPlay(true);
    setIsPlaying(true);
    playInterval = setInterval(() => {
      playFrame += 0.08;
      updateState();
    }, 80);
    return () => {
      clearInterval(playInterval);
    };
  };
  //??????
  const pauseHandle = () => {
    setIsPlaying(false);
    clearInterval(playInterval);
  };
  //??????
  const stopHandle = () => {
    setIsPlay(false);
    setIsPlaying(false);
    playFrame = 0;
    playStartTrigger = {};
    setPlayData([]);
    clearInterval(playInterval);
  };

  //??????????????????????????????
  const isElementStartPlay = (element) => {
    if (element.actImmediately) {
      return {
        isStart: true,
        startTime: 0
      };
    }
    for (let i = 0; i < element.triggers.length; i++) {
      if (playStartTrigger[element.triggers[i]]) {
        return {
          isStart: true,
          startTime: playStartTrigger[element.triggers[i]]
        };
      }
    }
    return {
      isStart: false,
      startTime: 0
    };
  };

  //??????????????????????????????
  const isPlayTriggerStart = (coordinates, id, playFrame) => {
    for (let i = 0; i < triggersInfo.length; i++) {
      if (triggersInfo[i].triggeredId.includes(id)) {
        const flag = isInTrigger(triggersInfo[i], coordinates);
        if (flag && !playStartTrigger[triggersInfo[i].id]) {
          playStartTrigger[triggersInfo[i].id] = playFrame;
        }
      }
    }
  };

  const updateState = () => {
    playUpdateHandle([...elementInfo, mainCarInfo]);
  };

  const playUpdateHandle = async (arr) => {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const obj = arr[i];
      if (obj.routes && obj.routes.length > 0) {
        const isElementStart = isElementStartPlay(obj);
        let coordinates = [];
        let angle;
        if (!isElementStart.isStart || obj.routes.length === 1) {
          coordinates = [obj.routes[0].position.x, obj.routes[0].position.y];
          angle = obj.routes[0].heading;
        }
        if (isElementStart.isStart && playFrame - isElementStart.startTime > 0) {
          const calcResult = await getPointByRouterAndTime(
            obj.routes,
            playFrame - isElementStart.startTime
          );
          if (calcResult.coordinates) {
            coordinates = calcResult.coordinates;
            angle = calcResult.angle;
            isPlayTriggerStart(calcResult.coordinates, obj.id, playFrame);
          }
        } else {
          coordinates = [obj.routes[0].position.x, obj.routes[0].position.y];
          angle = obj.routes[0].heading;
        }

        result.push({
          id: obj.id,
          type: obj.type,
          coordinates: coordinates,
          angle: angle,
          icon: obj.type === RESOURCE_TYPE.MAIN_CAR ? obj.icon : obj.icon2,
          anchorY: obj.h / 2,
          w: obj.w,
          h: obj.h,
          length: obj.length,
          width: obj.width,
          index: 0
        });
      }
    }
    setPlayData(result);
  };

  const layers = createMapLayer(mapData);
  if (isPlay) {
    const playLayers = createCarIconLayer('play-layer', playData, null);
    layers.push(playLayers);
  } else {
    //???????????????
    const editableGeoJsonLayer = new EditableGeoJsonLayer({
      id: 'geojson-layer',
      data: featuresCollection,
      selectedFeatureIndexes,
      pointRadiusMinPixels: 20, //????????????
      editHandlePointRadiusMinPixels: 40, //????????????
      getFillColor: [255, 255, 255, 0], //[255, 255, 255, 60], //??? ??? ????????????????????????
      getLineColor: getLineColor, // ????????????
      getEditHandlePointColor: getEditHandlePointColor,
      getEditHandlePointOutlineColor: getEditHandlePointOutlineColor,
      editHandlePointRadiusScale: 0,
      getTentativeLineColor: [0, 255, 0, 255], // ??????????????????  ??????????????????
      zIndex: -3,
      mode: mode,
      onClick: (e) => {
        if (
          e.object &&
          e.object.properties &&
          e.object.properties.type === RESOURCE_TYPE.TRIGGERS
        ) {
          clickCallback(e.object.properties.type, e.object.properties.elementId);
        }
      },
      onEdit
    });
    layers.push(editableGeoJsonLayer);
    //????????????
    const mainCarLayerData = formatIconDataFromInfo(mainCarInfo);
    const mainCarLayers = createCarIconLayer('car-layer', mainCarLayerData, clickCallback);
    layers.push(mainCarLayers);
    //???????????????
    const elementLayerData = formatIconDataFromElementInfo(elementInfo);
    const elementLayers = createCarIconLayer('element-layer', elementLayerData, clickCallback);
    layers.push(elementLayers);

    //?????????????????????
    if (routerData.length > 0) {
      const routerLayers = createRouterLayer('route-layer', routerData);
      layers.push(routerLayers);
    }
  }

  //?????????????????????
  const getRouterData = async () => {
    const points = await getBezierPointFromFeatures(
      [...elementInfo, mainCarInfo],
      currentElementId
    );
    const routerData = points.map((item, index) => {
      return {
        name: 'router' + index,
        path: item
      };
    });
    setRouterData(routerData);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      getRouterData();
    }, 200);
    return () => {
      clearTimeout(timer);
    };
  }, [elementInfo]);

  //------------------------------????????????--------------------------------
  //map  ????????????
  const onViewStateChange = ({ viewState }) => {
    setMapZoom(viewState.zoom);
  };
  //map  ????????????
  const handleMapModeChange = (value) => {
    setModeValue(value);
    if (value === 'view') {
      setMode(() => ViewMode);
    }
    if (value === 'point') {
      setMode(() => DrawPointMode);
    }
    if (value === 'line') {
      setMode(() => DrawLineStringMode);
    }
    if (value === 'eidt') {
      setMode(() => ModifyMode);
    }
    if (value === 'rotate') {
      setMode(() => RotateMode);
    }
    if (value === 'rectangle') {
      setMode(() => DrawRectangleMode);
    }
    if (value === 'translate') {
      setMode(() => TranslateMode);
    }
    if (value === 'scale') {
      setMode(() => ScaleMode);
    }
    if (value === 'translateAndscale') {
      setMode(() => translateAndScaleMode);
    }
    if (value === 'translateAndRotateMode') {
      setMode(() => translateAndRotateMode);
    }
  };

  //??????????????????????????????drop
  const dragEnterHandle = (e) => {
    e.preventDefault();
  };
  const dragOverHandle = (e) => {
    e.preventDefault();
  };
  //??????????????????
  const dragEnd = (e) => {
    if (isPlay) return;
    setTimeout(() => {
      setModeHandle(drag_type);
      drag_type = '';
    }, 200);
  };
  //??????  ??? map ??????
  const dropHandle = (e) => {
    // ------- foxfire ?????? ?????? ????????????
    /* ?????????????????? */
    e.stopPropagation();
    /* ?????????????????? */
    e.preventDefault();
    // ------- foxfire ?????? ?????? ????????????

    if (isPlay) return;
    if (drag_type === RESOURCE_TYPE.MAP) {
      setMapLoadInfo(JSON.parse(e.dataTransfer.getData('text')));
    } else if (drag_type === RESOURCE_TYPE.TRAFFIC_FLOW) {
      setTrafficFlowInfo(JSON.parse(e.dataTransfer.getData('text')));

      //??????????????????
      setResourceOperateType(RESOURCE_TYPE.TRAFFIC_FLOW);
      setModeHandle('');
      setResourceLoadTreeSelectKey([RESOURCE_TYPE.TRAFFIC_FLOW]);
      setCurrentElementId(-1);
      setCurrentElementIndex(-1);
      setSelectIndexHandle(RESOURCE_TYPE.TRAFFIC_FLOW, -1, -1, -1);
      setRotatePointToFeatrue(-1, -1);
    } else {
      isDropEnd = true;
    }
  };
  // ???????????? ??????
  const dragStart = (e, type, data = '') => {
    if (isPlay) return;
    drag_type = type;
    if (drag_type === RESOURCE_TYPE.MAP) {
      e.dataTransfer.setData('text', JSON.stringify(data));
    } else if (drag_type === RESOURCE_TYPE.TRAFFIC_FLOW) {
      e.dataTransfer.setData('text', JSON.stringify(data));
    } else {
      //???????????????????????????????????? ?????????????????????
      setModeValue('point');
      setMode(() => DrawPointMode);
    }
  };

  // ???????????????
  const onResourceLibHandle = (keys) => {
    setResourceLibType(keys[0]);
  };
  // ?????????????????????????????????
  const onResourceLoadHandle = (keys, info) => {
    setResourceLoadTreeSelectKey(keys);
    setResourceOperateType(info.node.type);
    setModeHandle(info.node.type);
    setCurrentElementId(keys[0]);
    setCurrentElementIndex(0);
    setSelectIndexHandle(info.node.type, -1, keys[0], 0);
    setRotatePointToFeatrue(keys[0], 0);
  };
  // deck ????????????
  const onDeckClick = (info, event) => {
    if (isPlay) return;
    if (event.srcEvent.ctrlKey) {
      if (resourceOperateType === RESOURCE_TYPE.MAIN_CAR) {
        // && mainCarInfo.routes.length === 1
        addNewElement(resourceOperateType, info.coordinate);
      }
      if (
        resourceOperateType === RESOURCE_TYPE.ELEMENT_CAR ||
        resourceOperateType === RESOURCE_TYPE.ELEMENT_PEOPLE ||
        resourceOperateType === RESOURCE_TYPE.ELEMENT_ANIMAL ||
        resourceOperateType === RESOURCE_TYPE.ELEMENT_BICYCLE
      ) {
        addNewElement(resourceOperateType, info.coordinate);
      }
    }
  };

  const onDeckHover = (info) => {
    // if (info && info.coordinate) {
    //   const meters = GPS.mercator_encrypt(info.coordinate[0], info.coordinate[1]);
    //   inputEl.current.innerHTML = `X:${parseInt(meters.x)},Y:${parseInt(meters.y)}`;
    // }
  };

  const deleteHandle = (index, id) => {
    if (isPlay) return;
    let newLen = 0;
    setFeaturesCollection((prevState) => {
      //?????????????????????
      const filterFeatures = prevState.features.filter((item) => {
        if (
          item.properties.type !== RESOURCE_TYPE.ROTATE_POINT &&
          item.properties.elementId === id &&
          item.properties.index === index
        ) {
          return false;
        }
        return true;
      });
      //???????????? index ????????????????????? ??????1
      const features = filterFeatures.map((item) => {
        if (
          item.properties.type !== RESOURCE_TYPE.ROTATE_POINT &&
          item.properties.elementId === id &&
          item.properties.index > index
        ) {
          item.properties.index = item.properties.index - 1;
        }
        return item;
      });
      newLen = features.length;
      return {
        type: 'FeatureCollection',
        features: features
      };
    });
  };

  const deleteObj = (type, id) => {
    if (isPlay) return;
    if (type === RESOURCE_TYPE.MAIN_CAR) {
      setMainCarInfo({});
    }
    if (type === RESOURCE_TYPE.TRAFFIC_FLOW) {
      setTrafficFlowInfo({});
    } else if (type === RESOURCE_TYPE.TRIGGERS) {
      setTriggersInfo((prevState) => {
        for (let i = 0; i < prevState.length; i++) {
          if (prevState[i].id === id) {
            prevState.splice(i, 1);
            break;
          }
        }
        return [...prevState];
      });
      //???????????????????????????
      setModeHandle('');
    } else {
      setElementInfo((prevState) => {
        for (let i = 0; i < prevState.length; i++) {
          if (prevState[i].type === type && prevState[i].id === id) {
            prevState.splice(i, 1);
            break;
          }
        }
        return [...prevState];
      });
    }

    setFeaturesCollection((prevState) => {
      //?????????????????????
      const filterFeatures = prevState.features.filter((item) => {
        if (item.properties.type === type && item.properties.elementId === id) {
          return false;
        }
        return true;
      });
      return {
        type: 'FeatureCollection',
        features: filterFeatures
      };
    });
  };

  //??????????????????
  const changePropsHandle = (e, index, id, propsType) => {
    if (isPlay) return;
    const val = parseInt(e.target.value);
    if (isNaN(val)) {
      return;
    }
    const features = features;
    setFeaturesCollection((prevState) => {
      const features = prevState.features.map((item) => {
        if (item.properties.elementId === id && item.properties.index === index) {
          item.properties[propsType] = val;
          //????????????????????????   ?????????????????????????????? ?????????????????????
          item.properties['changeProp'] = propsType === 'time' ? 'time' : 'velocity';
        }
        return item;
      });
      return {
        type: 'FeatureCollection',
        features: features
      };
    });
  };
  //?????????????????????
  const changeSwithHandle = (checked, type, id) => {
    if (isPlay) return;
    if (type === RESOURCE_TYPE.MAIN_CAR) {
      setMainCarInfo((prevState) => {
        return {
          ...prevState,
          actImmediately: checked
        };
      });
    } else {
      setElementInfo((prevState) => {
        for (let i = 0; i < prevState.length; i++) {
          if (prevState[i].id === id) {
            prevState[i].actImmediately = checked;
          }
        }
        return [...prevState];
      });
    }
  };
  //???????????????
  const addTrigger = (type, id) => {
    if (isPlay) return;
    if (type === RESOURCE_TYPE.MAIN_CAR) {
      setMainCarInfo((prevState) => {
        return {
          ...prevState,
          triggers: [...prevState.triggers, '']
        };
      });
    } else {
      setElementInfo((prevState) => {
        for (let i = 0; i < prevState.length; i++) {
          if (prevState[i].id === id) {
            prevState[i].triggers = [...prevState[i].triggers, ''];
          }
        }
        return [...prevState];
      });
    }
  };

  //???????????????
  const deleteTrigger = (index, type, id) => {
    if (isPlay) return;
    if (type === RESOURCE_TYPE.MAIN_CAR) {
      setMainCarInfo((prevState) => {
        prevState.triggers.splice(index, 1);
        return {
          ...prevState,
          triggers: [...prevState.triggers]
        };
      });
    } else {
      setElementInfo((prevState) => {
        for (let i = 0; i < prevState.length; i++) {
          if (prevState[i].id === id) {
            prevState[i].triggers.splice(index, 1);
            prevState[i].triggers = [...prevState[i].triggers];
          }
        }
        return [...prevState];
      });
    }
  };

  //???????????????
  const changeTriggerSelectHandle = (value, index, type, id) => {
    if (isPlay) return;
    if (type === RESOURCE_TYPE.MAIN_CAR) {
      setMainCarInfo((prevState) => {
        prevState.triggers[index] = value;
        return {
          ...prevState,
          triggers: [...prevState.triggers]
        };
      });
    } else {
      setElementInfo((prevState) => {
        for (let i = 0; i < prevState.length; i++) {
          if (prevState[i].id === id) {
            prevState[i].triggers[index] = value;
            prevState[i].triggers = [...prevState[i].triggers];
          }
        }
        return [...prevState];
      });
    }
  };

  //???????????????
  const addTriggerUser = (id) => {
    if (isPlay) return;
    setTriggersInfo((prevState) => {
      for (let i = 0; i < prevState.length; i++) {
        if (prevState[i].id === id) {
          prevState[i].triggeredId = [...prevState[i].triggeredId, ''];
        }
      }
      return [...prevState];
    });
  };
  //???????????????
  const changeUserSelectHandle = (value, index, id) => {
    if (isPlay) return;
    setTriggersInfo((prevState) => {
      for (let i = 0; i < prevState.length; i++) {
        if (prevState[i].id === id) {
          prevState[i].triggeredId[index] = value;
          prevState[i].triggeredId = [...prevState[i].triggeredId];
        }
      }
      return [...prevState];
    });
  };

  //???????????????
  const deleteTriggerUser = (index, id) => {
    if (isPlay) return;
    setTriggersInfo((prevState) => {
      for (let i = 0; i < prevState.length; i++) {
        if (prevState[i].id === id) {
          prevState[i].triggeredId.splice(index, 1);
          prevState[i].triggeredId = [...prevState[i].triggeredId];
        }
      }
      return [...prevState];
    });
  };

  //??????  isExit ????????????  isCheckChange //?????????????????????  isUseChangeResult ??????????????????????????????
  const saveHandle = async (isExit, isCheckChange = true, isUseChangeResult = true) => {
    const yamlData = {};
    if (!mapLoadInfo.url) {
      message.error('???????????????');
      return;
    }
    if (mainCarInfo.routes.length === 0) {
      message.error('???????????????');
      return;
    }
    if (mainCarInfo.routes.length === 1) {
      message.error('????????????????????????');
      return;
    }
    yamlData.MapFileName = mapLoadInfo.url;
    yamlData.Triggers = [];
    for (let i = 0; i < triggersInfo.length; i++) {
      const metersPosition = GPS.mercator_encrypt(
        triggersInfo[i].position.x,
        triggersInfo[i].position.y
      );

      yamlData.Triggers.push({
        id: triggersInfo[i].id,
        position: { x: metersPosition.x, y: metersPosition.y },
        size: {
          width: parseInt(triggersInfo[i].size.width),
          height: parseInt(triggersInfo[i].size.height)
        },
        triggeredId:
          triggersInfo[i].triggeredId.length > 0
            ? triggersInfo[i].triggeredId[0] === ''
              ? 0
              : triggersInfo[i].triggeredId[0]
            : 0
      });
    }
    yamlData.Agents = [];
    const mainCarRouter = [];
    for (let i = 0; i < mainCarInfo.routes.length; i++) {
      const metersPosition = GPS.mercator_encrypt(
        mainCarInfo.routes[i].position.x,
        mainCarInfo.routes[i].position.y
      );
      mainCarInfo.routes[i].velocity = mainCarInfo.routes[i].velocity / 3.6;
      mainCarRouter.push({
        ...mainCarInfo.routes[i],
        position: { x: metersPosition.x, y: metersPosition.y }
      });
    }
    yamlData.Agents.push({
      type: 'vehicle',
      subType: RESOURCE_TYPE.MAIN_CAR,
      id: 0,
      length: mainCarInfo.length,
      width: mainCarInfo.width,
      height: mainCarInfo.height,
      actImmediately: mainCarInfo.actImmediately,
      routes: mainCarRouter,
      triggers: formatTrigger(mainCarInfo.triggers)
    });

    for (let i = 0; i < elementInfo.length; i++) {
      const elementRouter = [];
      for (let j = 0; j < elementInfo[i].routes.length; j++) {
        const metersPosition = GPS.mercator_encrypt(
          elementInfo[i].routes[j].position.x,
          elementInfo[i].routes[j].position.y
        );
        if (elementInfo[i].routes[j].velocity < 0) {
          message.error(
            `${elementInfo[i].title}-${elementInfo[i].id}??????${j + 1}????????????????????????????????????0`
          );
          return;
        }
        for (let k = 0; k < j; k++) {
          if (elementInfo[i].routes[j].time <= elementInfo[i].routes[k].time) {
            message.error(
              `${elementInfo[i].title}-${elementInfo[i].id}??????${j + 1}????????????????????????????????????${
                k + 1
              }?????????????????????`
            );
            return;
          }
        }
        elementInfo[i].routes[j].velocity = elementInfo[i].routes[j].velocity / 3.6;
        delete elementInfo[i].routes[j].changeProp;
        delete elementInfo[i].routes[j].meters;
        elementRouter.push({
          ...elementInfo[i].routes[j],
          position: { x: metersPosition.x, y: metersPosition.y }
        });
      }
      yamlData.Agents.push({
        type: 'vehicle',
        subType: elementInfo[i].type,
        id: elementInfo[i].id,
        length: elementInfo[i].length,
        width: elementInfo[i].width,
        height: elementInfo[i].height,
        actImmediately: elementInfo[i].actImmediately,
        routes: elementRouter,
        triggers: formatTrigger(elementInfo[i].triggers)
      });
    }

    if (trafficFlowInfo.title) {
      yamlData.TrafficFlow = {
        vehicle: {
          proportion: {}
        },
        bicycle: {},
        pedestrian: {}
      };
      yamlData.TrafficFlow.vehicle.density = trafficFlowInfo.vehicle;
      yamlData.TrafficFlow.vehicle.proportion.private = trafficFlowInfo.proportion.private;
      yamlData.TrafficFlow.vehicle.proportion.business = trafficFlowInfo.proportion.business;
      yamlData.TrafficFlow.vehicle.proportion.engineering = trafficFlowInfo.proportion.engineering;
      yamlData.TrafficFlow.bicycle.density = trafficFlowInfo.bicycle;
      yamlData.TrafficFlow.pedestrian.density = trafficFlowInfo.pedestrian;
    }

    const yamlDoc = new YAML.Document();
    yamlDoc.contents = yamlData;
    let doc = yamlDoc.toString();
    console.log(doc);

    if (isExit) {
      //??????????????? ????????? ???????????????
      if (isCheckChange && lastSaveYaml !== doc) {
        setIsModalVisible(true);
        return;
      }
      //??????????????? ????????? ???????????????
      if (!isUseChangeResult) {
        doc = lastSaveYaml;
      }
    }

    let file;
    let properties = { type: 'text/plain' };
    try {
      file = new File([doc], 'file.txt', properties);
    } catch (e) {
      file = new Blob([doc], properties);
    }

    const caseInfo = JSON.parse(localStorage.caseInfo);
    const formData = new FormData();
    formData.append('menuId', caseInfo.menuId);
    formData.append('name', caseInfo.caseName);
    formData.append('tags', caseInfo.caseTag);
    formData.append('type', 'yaml');
    formData.append('file', file);
    if (localStorage.caseType === 'edit') {
      formData.append('id', caseInfo.id);
    }
    let data = {};
    if (localStorage.caseType === 'edit') {
      data = await updateApi(formData);
    } else {
      data = await saveApi(formData);
    }
    if (data.data.code === 200) {
      lastSaveYaml = doc;
      setIsModalVisible(false);
      if (!isCreateTask) {
        message.success('??????!');
      }
      if (isExit) {
        window.close();
      } else {
        localStorage.caseType = 'edit';
        caseInfo.id = data.data.data.id;
        localStorage.caseData = data.data.data.caseFileUrl;
        localStorage.caseInfo = JSON.stringify(caseInfo);
        if (isCreateTask) {
          createTask();
        }
      }
    }
  };

  //??????
  const save = () => {
    saveHandle(false, false, true);
  };
  const exit = () => {
    saveHandle(true, true, true);
  };

  const modalHandleOk = () => {
    saveHandle(true, false, true);
  };
  const modalHandleOkNoSave = () => {
    saveHandle(true, false, false);
  };

  const modalHandleCancel = () => {
    setIsModalVisible(false);
  };
  const run = () => {
    setIsTaskModalVisible(true);
    setTaskName('task_' + new Date().toLocaleString());
    getAlgorithmHandle();
  };
  const getAlgorithmHandle = async () => {
    const { data } = await getAlgorithm();
    if (data.code === 200) {
      setAlgorithmArr(data.data);
    }
  };

  const algorithmChangeHandle = (value) => {
    setAlgorithm(value);
  };
  const taskNameChangeHandle = (e) => {
    setTaskName(e.target.value);
  };

  //??????
  const modalTaskHandleOk = async () => {
    if (!taskName) {
      message.info('?????????????????????');
      return;
    }
    if (!algorithm) {
      message.info('???????????????');
      return;
    }
    isCreateTask = true;
    setDisabledBtn(true);
    saveHandle(false, false, true);
  };
  //??????
  const createTask = async () => {
    isCreateTask = false;
    setDisabledBtn(false);
    const caseInfo = JSON.parse(localStorage.caseInfo);
    const { data } = await createTaskApi({
      algorithm: algorithm,
      name: taskName,
      caseIds: caseInfo.id
    });
    if (data.code === 200) {
      message.success('??????????????????!');
      setIsTaskModalVisible(false);
    }
  };

  const modalTaskHandleCancel = () => {
    setIsTaskModalVisible(false);
  };

  const getDataFromYaml = (yaml, mapData) => {
    const editData = YAML.parse(yaml);
    lastSaveYaml = YAML.stringify(editData);
    for (let i = 0; i < mapData.length; i++) {
      if (mapData[i].url === editData.MapFileName) {
        setMapLoadInfo(mapData[i]);
      }
    }
    for (let i = 0; i < editData.Triggers.length; i++) {
      const pos = GPS.mercator_decrypt(
        editData.Triggers[i].position.x,
        editData.Triggers[i].position.y
      );
      const coordinates = [pos.lon, pos.lat];
      const coordinatesArr = createRectangle(coordinates, editData.Triggers[i].size, true);
      setFeaturesCollection((prevState) => {
        return {
          type: 'FeatureCollection',
          features: [
            ...prevState.features,
            {
              type: 'Feature',
              properties: {
                shape: 'Rectangle',
                type: RESOURCE_TYPE.TRIGGERS,
                heading: 0,
                index: 0,
                selected: false,
                elementId: editData.Triggers[i].id,
                coordinates,
                size: editData.Triggers[i].size
              },
              geometry: {
                type: 'Polygon',
                coordinates: [coordinatesArr]
              }
            }
          ]
        };
      });
    }
    setMainCarInfo(Resource_list_main_car[0]);
    for (let i = 0; i < editData.Agents.length; i++) {
      if (editData.Agents[i].id >= createElementId) {
        createElementId = editData.Agents[i].id + 1;
      }
      if (editData.Agents[i].id === 0) {
        for (let j = 0; j < editData.Agents[i].routes.length; j++) {
          const pos = GPS.mercator_decrypt(
            editData.Agents[i].routes[j].position.x,
            editData.Agents[i].routes[j].position.y
          );
          const coordinates = [pos.lon, pos.lat];
          setFeaturesCollection((prevState) => {
            return {
              type: 'FeatureCollection',
              features: [
                ...prevState.features,
                {
                  type: 'Feature',
                  properties: {
                    type: RESOURCE_TYPE.MAIN_CAR,
                    heading: editData.Agents[i].routes[j].heading,
                    index: editData.Agents[i].routes[j].index,
                    elementId: editData.Agents[i].id,
                    selected: editData.Agents[i].routes[j].selected,
                    changeProp: 'velocity',
                    accelerate: editData.Agents[i].routes[j].accelerate,
                    velocity: editData.Agents[i].routes[j].velocity * 3.6 // m/s ??????km/h
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: coordinates
                  }
                }
              ]
            };
          });
        }
      } else {
        let type_list = Resource_list_element_car[0];
        if (editData.Agents[i].subType === RESOURCE_TYPE.ELEMENT_PEOPLE) {
          type_list = Resource_list_element_people[0];
        }
        if (editData.Agents[i].subType === RESOURCE_TYPE.ELEMENT_ANIMAL) {
          type_list = Resource_list_element_animal[0];
        }
        if (editData.Agents[i].subType === RESOURCE_TYPE.ELEMENT_BICYCLE) {
          type_list = Resource_list_element_bicycle[0];
        }
        setElementInfo((prevState) => {
          return [...prevState, Object.assign({}, type_list, { id: editData.Agents[i].id })];
        });
        //??????????????????  ??????????????????  ????????? getDataFromCollection  ??????????????????????????????ID ?????????
        setCurrentElementId(editData.Agents[i].id);
        for (let j = 0; j < editData.Agents[i].routes.length; j++) {
          const pos = GPS.mercator_decrypt(
            editData.Agents[i].routes[j].position.x,
            editData.Agents[i].routes[j].position.y
          );
          const coordinates = [pos.lon, pos.lat];
          setFeaturesCollection((prevState) => {
            return {
              type: 'FeatureCollection',
              features: [
                ...prevState.features,
                {
                  type: 'Feature',
                  properties: {
                    type: editData.Agents[i].subType,
                    heading: editData.Agents[i].routes[j].heading,
                    index: editData.Agents[i].routes[j].index,
                    elementId: editData.Agents[i].id,
                    selected: editData.Agents[i].routes[j].selected,
                    changeProp: 'velocity',
                    accelerate: editData.Agents[i].routes[j].accelerate,
                    velocity: editData.Agents[i].routes[j].velocity * 3.6 // m/s ??????km/h
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: coordinates
                  }
                }
              ]
            };
          });
        }
      }
    }
  };

  const getDataFromYamlAsnyc = (yaml) => {
    const editData = YAML.parse(yaml);
    for (let i = 0; i < editData.Triggers.length; i++) {
      setTriggersInfo((prevState) => {
        for (let j = 0; j < prevState.length; j++) {
          if (prevState[j].id === editData.Triggers[i].id) {
            prevState[j].triggeredId = [editData.Triggers[i].triggeredId];
          }
        }
        return [...prevState];
      });
    }
    for (let i = 0; i < editData.Agents.length; i++) {
      if (editData.Agents[i].id === 0) {
        setMainCarInfo((prevState) => {
          return {
            ...prevState,
            actImmediately: editData.Agents[i].actImmediately,
            triggers: triggerFormat(editData.Agents[i].triggers)
          };
        });
      } else {
        setElementInfo((prevState) => {
          for (let j = 0; j < prevState.length; j++) {
            if (prevState[j].id === editData.Agents[i].id) {
              prevState[j].actImmediately = editData.Agents[i].actImmediately;
              prevState[j].triggers = triggerFormat(editData.Agents[i].triggers);
            }
          }
          return [...prevState];
        });
      }
    }
  };

  //??????  ?????? ????????? ???????????????
  const formatTrigger = (arr) => {
    if (!arr) return;
    let resultInfo = arr.filter((item) => {
      return item != '' || item === 0;
    });
    resultInfo = Array.from(new Set(resultInfo));
    resultInfo = resultInfo.map((item) => {
      return {
        id: item
      };
    });
    return resultInfo;
  };

  const triggerFormat = (arr) => {
    const resultInfo = arr.map((item) => {
      return item.id;
    });
    return resultInfo;
  };

  const tipFormatter = (value) => {
    return value + '%';
  };

  const sliderChangeTypeHandle = (value) => {
    setTrafficFlowInfo((prevState) => {
      return {
        ...prevState,
        proportion: {
          private: value[0],
          business: value[1] - value[0],
          engineering: 100 - value[1]
        }
      };
    });
  };

  const sliderChangeCarHandle = (value) => {
    setTrafficFlowInfo((prevState) => {
      return {
        ...prevState,
        vehicle: value
      };
    });
  };

  const sliderChangePeopleHandle = (value) => {
    setTrafficFlowInfo((prevState) => {
      return {
        ...prevState,
        pedestrian: value
      };
    });
  };

  const sliderChangeBicycleHandle = (value) => {
    setTrafficFlowInfo((prevState) => {
      return {
        ...prevState,
        bicycle: value
      };
    });
  };

  //------------------------------????????????--------------------------------
  //??????????????? ?????????
  const renderResourceLoadTree = useMemo(() => {
    let len = 0;
    const elementArr = elementInfo.map((item) => {
      return { title: item.title + '-' + item.id, key: item.id, type: item.type };
    });
    const triggersArr = triggersInfo.map((item) => {
      return { title: item.title + '-' + item.id, key: item.id, type: item.type };
    });
    len += elementArr.length;
    len += triggersArr.length;

    let mapTitle = mapLoadInfo.title;
    if (mapLoadInfo.title) {
      mapTitle = mapLoadInfo.title.split('.')[0];
    }
    const result = [
      {
        title: '??????',
        key: 'map_tab',
        type: 'map_tab',
        children: [{ title: mapTitle, key: RESOURCE_TYPE.MAP, type: RESOURCE_TYPE.MAP }]
      }
    ];
    if (mainCarInfo.title) {
      result.push({
        title: '????????????',
        key: 'main_car_tab',
        type: 'main_car_tab',
        children: [{ title: mainCarInfo.title, key: mainCarInfo.id, type: RESOURCE_TYPE.MAIN_CAR }]
      });
      len++;
    }
    if (elementArr.length > 0) {
      result.push({
        title: '????????????',
        key: 'element_tab',
        type: 'element_tab',
        children: elementArr
      });
    }
    if (triggersArr.length > 0) {
      result.push({
        title: '?????????',
        key: 'trigger_tab',
        type: 'trigger_tab',
        children: triggersArr
      });
    }
    if (trafficFlowInfo.title) {
      result.push({
        title: '?????????',
        key: RESOURCE_TYPE.TRAFFIC_FLOW,
        type: RESOURCE_TYPE.TRAFFIC_FLOW
      });
    }
    //??????????????? ????????????   ?????????????????????
    if (lastFileLen !== len) {
      setRenderFlag(false);
      setTimeout(() => {
        setRenderFlag(true);
      }, 0);
    }
    lastFileLen = len;
    return result;
  }, [
    mapLoadInfo.title,
    mainCarInfo.title,
    elementInfo.length,
    triggersInfo.length,
    trafficFlowInfo
  ]);
  //?????????
  const renderResourceList = useMemo(() => {
    let Resource_list = [];
    if (resourceLibType === RESOURCE_TYPE.MAP) {
      Resource_list = mapListData;
    } else if (resourceLibType === RESOURCE_TYPE.MAIN_CAR) {
      Resource_list = Resource_list_main_car;
    } else if (resourceLibType === RESOURCE_TYPE.ELEMENT_CAR) {
      Resource_list = Resource_list_element_car;
    } else if (resourceLibType === RESOURCE_TYPE.ELEMENT_PEOPLE) {
      Resource_list = Resource_list_element_people;
    } else if (resourceLibType === RESOURCE_TYPE.ELEMENT_ANIMAL) {
      Resource_list = Resource_list_element_animal;
    } else if (resourceLibType === RESOURCE_TYPE.ELEMENT_BICYCLE) {
      Resource_list = Resource_list_element_bicycle;
    } else if (resourceLibType === RESOURCE_TYPE.TRIGGERS) {
      Resource_list = Resource_list_triggers;
    } else if (resourceLibType === RESOURCE_TYPE.TRAFFIC_FLOW) {
      Resource_list = Resource_traffic_flow;
    }

    return Resource_list.map((item, index) => {
      return (
        <div key={index} className='resource-list-item'>
          <div className='resource-list-item-box'>
            <img
              src={item.icon}
              onDragEnd={dragEnd}
              onDragStart={(e) => {
                dragStart(e, resourceLibType, item);
              }}
            ></img>
          </div>
          <div className='resource-list-item-txt'>{item.title}</div>
        </div>
      );
    });
  }, [resourceLibType, isPlay, mapListData]);

  //???????????????
  const triggersSelect = useMemo(() => {
    return triggersInfo.map((item) => {
      return item.id;
    });
  }, [triggersInfo]);

  //???????????????
  const userSelect = useMemo(() => {
    const userList = [];
    if (mainCarInfo.title) {
      userList.push(mainCarInfo.id);
    }
    elementInfo.forEach((item) => {
      userList.push(item.id);
    });
    return userList;
  }, [mainCarInfo, elementInfo]);

  //???????????????
  const renderResourceInfo = useMemo(() => {
    let selectInfo = {};
    if (resourceOperateType === RESOURCE_TYPE.MAP) {
      selectInfo = mapLoadInfo;
    }
    if (resourceOperateType === RESOURCE_TYPE.MAIN_CAR) {
      selectInfo = mainCarInfo;
    }
    if (
      resourceOperateType === RESOURCE_TYPE.ELEMENT_CAR ||
      resourceOperateType === RESOURCE_TYPE.ELEMENT_PEOPLE ||
      resourceOperateType === RESOURCE_TYPE.ELEMENT_ANIMAL ||
      resourceOperateType === RESOURCE_TYPE.ELEMENT_BICYCLE
    ) {
      for (let i = 0; i < elementInfo.length; i++) {
        if (elementInfo[i].id === currentElementId) {
          selectInfo = elementInfo[i];
          break;
        }
      }
    }
    if (resourceOperateType === RESOURCE_TYPE.TRIGGERS) {
      for (let i = 0; i < triggersInfo.length; i++) {
        if (triggersInfo[i].id === currentElementId) {
          selectInfo = triggersInfo[i];
          break;
        }
      }
    }
    if (resourceOperateType === RESOURCE_TYPE.TRAFFIC_FLOW) {
      selectInfo = trafficFlowInfo;
    }
    return (
      <React.Fragment>
        <div className='title'>
          {selectInfo.title}
          {resourceOperateType !== RESOURCE_TYPE.MAP ? (
            <Popconfirm
              title='???????????????????????????????'
              onConfirm={() => {
                deleteObj(selectInfo.type, selectInfo.id);
              }}
              onCancel={() => {}}
              okText='??????'
              cancelText='??????'
            >
              <span className='del'>
                <DeleteOutlined className='del-btn'></DeleteOutlined>
              </span>
            </Popconfirm>
          ) : null}
        </div>
        {selectInfo.type === RESOURCE_TYPE.TRIGGERS ? (
          <div className='info'>
            <div>
              <span className='txt'> id : </span>
              <span className='val'>{selectInfo.id}</span>
            </div>
            <div>
              <span className='props'>
                <span>X : </span>
                <span>
                  {parseFloat(
                    GPS.mercator_encrypt(selectInfo.position.x, selectInfo.position.y).x
                  ).toFixed(2)}
                </span>
              </span>
              <span className='props'>
                <span>Y : </span>
                <span>
                  {parseFloat(
                    GPS.mercator_encrypt(selectInfo.position.x, selectInfo.position.y).y
                  ).toFixed(2)}
                </span>
              </span>
            </div>
            <div>
              <span className='props'>
                <span>??? : </span>
                <span>{selectInfo.size.width}</span>
              </span>
              <span className='props'>
                <span>??? : </span>
                <span>{selectInfo.size.height}</span>
              </span>
            </div>
          </div>
        ) : null}
        {selectInfo.type !== RESOURCE_TYPE.TRIGGERS && selectInfo.length ? (
          <div className='info'>
            <div>
              <span className='txt'> id : </span>
              <span className='val'>{selectInfo.id}</span>
            </div>

            <div>
              <span className='txt'> ?????? : </span>
              <span className='val'>{selectInfo.title}</span>
            </div>
            <div>
              <span className='props'>
                <span>??? : </span>
                <span>{selectInfo.length}</span>
              </span>
              <span className='props'>
                <span>??? : </span>
                <span>{selectInfo.width}</span>
              </span>
              <span className='props'>
                <span>??? : </span>
                <span>{selectInfo.height}</span>
              </span>
            </div>
          </div>
        ) : null}
        {selectInfo.type !== RESOURCE_TYPE.TRIGGERS &&
        resourceOperateType !== RESOURCE_TYPE.MAP &&
        resourceOperateType !== RESOURCE_TYPE.TRAFFIC_FLOW ? (
          <div className='tip'>??????????????????ctrl?????????</div>
        ) : null}
        {selectInfo.routes && selectInfo.routes.length > 0 ? (
          <div className='router'>
            {selectInfo.routes.map((item, index) => {
              return (
                <div className='router-item' key={index}>
                  <div className='seq'>
                    {index + 1}???
                    <DeleteOutlined
                      onClick={() => {
                        deleteHandle(index, selectInfo.id);
                      }}
                      className='del-btn'
                    ></DeleteOutlined>
                  </div>
                  <div>
                    <span className='txt'> X : </span>
                    <span className='val'>
                      {parseFloat(GPS.mercator_encrypt(item.position.x, item.position.y).x).toFixed(
                        2
                      )}
                    </span>
                  </div>
                  <div>
                    <span className='txt'> Y : </span>
                    <span className='val'>
                      {parseFloat(GPS.mercator_encrypt(item.position.x, item.position.y).y).toFixed(
                        2
                      )}
                    </span>
                  </div>
                  <div>
                    <span className='txt'>?????? : </span>
                    <span className='val'>
                      <InputNumber
                        value={item.velocity}
                        onBlur={(e) => {
                          changePropsHandle(e, index, selectInfo.id, 'velocity');
                        }}
                      ></InputNumber>
                      &nbsp;km/h
                    </span>
                  </div>
                  <div>
                    <span className='txt'> ?????? : </span>
                    <span className='val'>
                      <InputNumber
                        value={item.heading}
                        max={360}
                        min={-360}
                        onBlur={(e) => {
                          changePropsHandle(e, index, selectInfo.id, 'heading');
                        }}
                      ></InputNumber>
                    </span>
                  </div>
                  <div>
                    <span className='txt'> ?????? : </span>
                    {index === 0 ? (
                      <span className='val'>{item.time}</span>
                    ) : (
                      <span className='val'>
                        <InputNumber
                          value={item.time}
                          onBlur={(e) => {
                            changePropsHandle(e, index, selectInfo.id, 'time');
                          }}
                        ></InputNumber>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        {selectInfo.triggers ? (
          <div className='triggers'>
            <div>
              ????????????
              <span className='swith'>
                <Switch
                  checked={selectInfo.actImmediately}
                  onChange={(e) => {
                    changeSwithHandle(e, selectInfo.type, selectInfo.id);
                  }}
                />
              </span>
            </div>
            {!selectInfo.actImmediately ? (
              <React.Fragment>
                <div className='list'>
                  {selectInfo.triggers.map((item, index) => {
                    return (
                      <div className='item' key={index}>
                        ?????????ID
                        <span>
                          <Select
                            value={item}
                            onChange={(e) => {
                              changeTriggerSelectHandle(e, index, selectInfo.type, selectInfo.id);
                            }}
                            className='select'
                          >
                            {triggersSelect.map((triggersSelectItem, subIndex) => {
                              return (
                                <Option key={subIndex} value={triggersSelectItem}>
                                  {triggersSelectItem}
                                </Option>
                              );
                            })}
                          </Select>
                        </span>
                        <DeleteOutlined
                          style={{ marginLeft: 5, cursor: 'pointer' }}
                          onClick={() => {
                            deleteTrigger(index, selectInfo.type, selectInfo.id);
                          }}
                        ></DeleteOutlined>
                      </div>
                    );
                  })}
                </div>
                <div
                  className='add'
                  onClick={() => {
                    addTrigger(selectInfo.type, selectInfo.id);
                  }}
                >
                  <PlusCircleOutlined></PlusCircleOutlined>&nbsp;&nbsp;???????????????
                </div>{' '}
              </React.Fragment>
            ) : null}
          </div>
        ) : null}
        {selectInfo.triggeredId ? (
          <React.Fragment>
            <div className='triggers'>
              <div className='list'>
                {selectInfo.triggeredId.map((item, index) => {
                  return (
                    <div className='item' key={index}>
                      ?????????ID
                      <span>
                        <Select
                          value={item}
                          onChange={(e) => {
                            changeUserSelectHandle(e, index, selectInfo.id);
                          }}
                          className='select'
                        >
                          {userSelect.map((userItem, subIndex) => {
                            return (
                              <Option key={subIndex} value={userItem}>
                                {userItem}
                              </Option>
                            );
                          })}
                        </Select>
                      </span>
                      <DeleteOutlined
                        style={{ marginLeft: 5, cursor: 'pointer' }}
                        onClick={() => {
                          deleteTriggerUser(index, selectInfo.id);
                        }}
                      ></DeleteOutlined>
                    </div>
                  );
                })}
              </div>
              {selectInfo.triggeredId.length > 0 ? null : (
                <div
                  className='add'
                  onClick={() => {
                    addTriggerUser(selectInfo.id);
                  }}
                >
                  <PlusCircleOutlined></PlusCircleOutlined>&nbsp;&nbsp;???????????????
                </div>
              )}
            </div>
          </React.Fragment>
        ) : null}
        {resourceOperateType == RESOURCE_TYPE.TRAFFIC_FLOW && selectInfo.title ? (
          <React.Fragment>
            <div className='traffic-info'>
              <div className='tip'>??????????????????</div>
              <div className='slider-box'>
                <div className='box box-width-all'>
                  <Slider
                    range
                    getPopupContainer={(trigger) => trigger.parentNode}
                    defaultValue={[
                      trafficFlowInfo.proportion.private,
                      trafficFlowInfo.proportion.private + trafficFlowInfo.proportion.business
                    ]}
                    onAfterChange={sliderChangeTypeHandle}
                    tooltipVisible
                    tipFormatter={tipFormatter}
                  />
                </div>
                <div className='type-line'>
                  <div>??????</div>
                  <div>??????</div>
                  <div>?????????</div>
                </div>
              </div>
              <div className='tip border-top'>????????????</div>
              <div className='slider-box'>
                <div className='txt'>??????</div>
                <div className='box'>
                  <Slider
                    tooltipVisible
                    defaultValue={trafficFlowInfo.vehicle}
                    getPopupContainer={(trigger) => trigger.parentNode}
                    onAfterChange={sliderChangeCarHandle}
                    tipFormatter={tipFormatter}
                  />
                </div>
              </div>
              <div className='slider-box'>
                <div className='txt'>??????</div>
                <div className='box'>
                  <Slider
                    defaultValue={trafficFlowInfo.pedestrian}
                    onAfterChange={sliderChangePeopleHandle}
                    tooltipVisible
                    tipFormatter={tipFormatter}
                  />
                </div>
              </div>
              <div className='slider-box'>
                <div className='txt'>?????????</div>
                <div className='box'>
                  <Slider
                    defaultValue={trafficFlowInfo.bicycle}
                    tooltipVisible
                    onAfterChange={sliderChangeBicycleHandle}
                    tipFormatter={tipFormatter}
                  />
                </div>
              </div>
            </div>
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  }, [
    resourceOperateType,
    currentElementId,
    mapLoadInfo,
    mainCarInfo,
    elementInfo,
    triggersInfo,
    trafficFlowInfo,
    isPlay
  ]);

  const caseInfo = JSON.parse(localStorage.caseInfo);
  //ViewState ???????????????  initialViewState ???????????????
  return (
    <div className='map-edit-wrap'>
      <div className='menu-bar'>
        <div className='title'>???????????????{caseInfo.caseName}</div>
        <div className='save-btn' onClick={save}>
          ??????
        </div>
        <div className='run-btn' onClick={run}>
          ????????????
        </div>
        <div className='exit-btn' onClick={exit}>
          ???????????????
          <span className='txt'>
            <LoginOutlined />
          </span>
        </div>
      </div>
      <div className='content-box'>
        <div className='left-box'>
          <div className='resource-select'>
            {renderFlag ? (
              <DirectoryTree
                defaultExpandAll
                selectedKeys={resourceLoadTreeSelectKey}
                onSelect={onResourceLoadHandle}
                treeData={renderResourceLoadTree}
              />
            ) : null}
          </div>
          <div className='resource-lib'>
            <DirectoryTree
              defaultExpandAll
              onSelect={onResourceLibHandle}
              treeData={Resource_lib_tree}
            />
          </div>
          {/* <div>
            <Select
              defaultValue='view'
              value={modeValue}
              style={{ width: '100%' }}
              onChange={handleMapModeChange}
            >
              ViewMode
              <Option value='view'>??????</Option>
              <Option value='point'>???</Option>
              <Option value='line'>???</Option>
              <Option value='eidt'>??????</Option>
              <Option value='rotate'>??????</Option>
              <Option value='rectangle'>??????</Option>
              <Option value='translate'>??????</Option>
              <Option value='scale'>??????</Option>
              <Option value='translateAndscale'>??????+??????</Option>
              <Option value='translateAndRotateMode'>??????+??????</Option>
            </Select>
          </div> */}
        </div>
        <div className='center-box'>
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
                <div className='tool-bar' ref={inputEl}></div>
                {isPlay ? (
                  <React.Fragment>
                    <div className='play-tip-top-left'></div>
                    <div className='play-tip-top-right'></div>
                    <div className='play-tip-bottom-left'></div>
                    <div className='play-tip-bottom-right'></div>
                    <div className='play-tip-txt'>????????????</div>
                  </React.Fragment>
                ) : null}
                <DeckGL
                  initialViewState={{
                    longitude: 0,
                    latitude: 0,
                    zoom: 20,
                    minZoom: 18,
                    maxZoom: 21,
                    bearing: 0
                  }}
                  parameters={{
                    // clearColor: [0.15, 0.6, 0.15, 1]
                    clearColor: [0.86, 0.86, 0.86, 1]
                  }}
                  // onHover={onDeckHover}
                  onClick={onDeckClick}
                  onViewStateChange={onViewStateChange}
                  layers={layers}
                  controller={{
                    doubleClickZoom: false,
                    touchRotate: false,
                    keyboard: false,
                    dragRotate: false
                  }}
                ></DeckGL>
              </div>
            )}
          </div>
          <div className='play-box'>
            <Tooltip placement='top' title={'??????'}>
              <div className='stop-btn' onClick={stopHandle}>
                <StopOutlined />
              </div>
            </Tooltip>
            {isPlaying ? (
              <Tooltip placement='top' title={'??????'}>
                <div className='pause-btn' onClick={pauseHandle}>
                  <PauseCircleOutlined />
                </div>
              </Tooltip>
            ) : (
              <Tooltip placement='top' title={'??????'}>
                <div className='play-btn' onClick={playHandle}>
                  <PlayCircleOutlined />
                </div>
              </Tooltip>
            )}
          </div>
          <div className='resource-list-box'>
            <div className='resource-list'>{renderResourceList}</div>
          </div>
        </div>
        <div className='right-box'>{renderResourceInfo}</div>
      </div>
      <Modal
        title='???????????????'
        visible={isModalVisible}
        okText='??????'
        cancelText='??????'
        footer={
          <div>
            <Button onClick={modalHandleOkNoSave}>?????????</Button>
            <Button type='primary' onClick={modalHandleOk}>
              ??????
            </Button>
            <Button onClick={modalHandleCancel}>??????</Button>
          </div>
        }
      >
        <div>???????????????,????????????????????????</div>
      </Modal>
      <Modal
        title='????????????'
        className='create-task-modal'
        visible={isTaskModalVisible}
        onOk={modalTaskHandleOk}
        onCancel={modalTaskHandleCancel}
        okText='??????'
        cancelText='??????'
        okButtonProps={{
          disabled: disabledBtn
        }}
      >
        <div className='create-task-list'>
          <div className='create-task-item'>
            ???????????????
            <input value={taskName || ''} onChange={taskNameChangeHandle} className='input'></input>
          </div>
          <div className='create-task-item'>
            ???????????????
            <Select defaultValue='?????????' onChange={algorithmChangeHandle} className='select'>
              {algorithmArr.map((item, index) => {
                return (
                  <Option key={index} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MapEdit;
