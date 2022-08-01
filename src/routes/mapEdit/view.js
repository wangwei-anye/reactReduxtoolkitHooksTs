import React, { useState, useEffect } from 'react';
import { Spin, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  LoginOutlined
} from '@ant-design/icons';
import DeckGL from '@deck.gl/react';
import getDataFromXodr from '@/utils/getDataFromXodr';
import getReplayDataFromXosc, { loadMapAndCreateFile } from '@/utils/getReplayDataFromXosc';
import { createMapLayer, createCarIconLayer } from './lib/layers';
import { GPS } from './lib/GPS';
import lodash from 'lodash';
import qs from 'qs';
import { Resource_list_main_car, Resource_list_element_car } from './lib/constant';
import './index.less';
let playInterval;
let initScenarioEngine;
let scenarioEngine;
const MapEdit = () => {
  // 地图
  const [mapData, setMapData] = useState({ solidLines: [], brokenLines: [], referenceLines: [] });

  //是否播放中
  const [isPlaying, setIsPlaying] = useState(false);
  const [playData, setPlayData] = useState([]);

  //初始化
  useEffect(() => {
    const prarms = qs.parse(lodash.split(window.location.search, '?')[1]);
    init(prarms.xoscUrl, prarms.mapUrl);
  }, []);

  const init = async (xoscUrl, mapUrl) => {
    try {
      await loadMapAndCreateFile(mapUrl);
      initScenarioEngine = await getReplayDataFromXosc(xoscUrl);
      scenarioEngine = initScenarioEngine();
      setMapHandle(mapUrl);
      scenarioEngine.step(0);
      scenarioEngine.prepareGroundTruth(0);
      updateState();
    } catch (error) {}
  };

  const initReplay = () => {
    scenarioEngine = initScenarioEngine();
    scenarioEngine.step(0);
    scenarioEngine.prepareGroundTruth(0);
    updateState();
  };

  // 设置地图
  const setMapHandle = async (mapUrl) => {
    try {
      const result = await getDataFromXodr(mapUrl);
      setMapData(result);
    } catch (error) {}
  };

  const playHandle = () => {
    setIsPlaying(true);
    playInterval = setInterval(() => {
      updateState();
    }, 20);
    return () => {
      clearInterval(playInterval);
    };
  };
  //暂停
  const pauseHandle = () => {
    setIsPlaying(false);
    clearInterval(playInterval);
  };
  //停止
  const stopHandle = () => {
    setIsPlaying(false);
    setPlayData([]);
    clearInterval(playInterval);
    initReplay();
  };

  const updateState = () => {
    scenarioEngine.step(0.02);
    scenarioEngine.prepareGroundTruth(0.02);
    const isEnd = scenarioEngine.GetQuitFlag();
    const result = [];
    for (let i = 0; i < scenarioEngine.entities.object_.size(); i++) {
      let entity = scenarioEngine.entities.object_.get(i);
      const id = entity.GetId();
      var pos = entity.pos_;
      const angle = parseInt((180 / Math.PI) * pos.GetH());
      let obj = {};
      if (id === 0) {
        obj = Resource_list_main_car[0];
      } else {
        obj = Resource_list_element_car[0];
      }
      const coordinates = GPS.mercator_decrypt(pos.GetX(), pos.GetY());
      result.push({
        id: id,
        type: obj.type,
        coordinates: [coordinates.lon, coordinates.lat],
        angle: angle,
        icon: obj.icon,
        anchorY: obj.h / 2,
        w: obj.w,
        h: obj.h,
        length: obj.length,
        width: obj.width,
        index: 0
      });
    }
    setPlayData(result);
  };

  const layers = createMapLayer(mapData);
  const playLayers = createCarIconLayer('play-layer', playData, null);
  layers.push(playLayers);

  const exit = () => {
    window.close();
  };

  return (
    <div className='map-edit-wrap'>
      <div className='menu-bar'>
        <div className='exit-btn' onClick={exit}>
          退出
          <span className='txt'>
            <LoginOutlined />
          </span>
        </div>
      </div>
      <div className='content-box'>
        <div className='center-box'>
          <div className='map-box-wrap'>
            <div className='map-box'>
              <React.Fragment>
                <div className='play-tip-top-left'></div>
                <div className='play-tip-top-right'></div>
                <div className='play-tip-bottom-left'></div>
                <div className='play-tip-bottom-right'></div>
                <div className='play-tip-txt'>播放模式</div>
              </React.Fragment>
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
                layers={layers}
                controller={{
                  doubleClickZoom: false,
                  touchRotate: false,
                  keyboard: false,
                  dragRotate: false
                }}
              ></DeckGL>
            </div>
          </div>
          <div className='play-box'>
            <Tooltip placement='top' title={'停止'}>
              <div className='stop-btn' onClick={stopHandle}>
                <StopOutlined />
              </div>
            </Tooltip>
            {isPlaying ? (
              <Tooltip placement='top' title={'暂停'}>
                <div className='pause-btn' onClick={pauseHandle}>
                  <PauseCircleOutlined />
                </div>
              </Tooltip>
            ) : (
              <Tooltip placement='top' title={'播放'}>
                <div className='play-btn' onClick={playHandle}>
                  <PlayCircleOutlined />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapEdit;
