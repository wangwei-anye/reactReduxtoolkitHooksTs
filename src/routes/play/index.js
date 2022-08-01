import React, { PureComponent } from 'react';
import { getXVIZConfig } from '@xviz/parser';
import {
  LogViewer,
  PlaybackControl,
  MeterWidget,
  TrafficLightWidget,
  TurnSignalWidget,
  XVIZPanel,
  VIEW_MODE
} from 'streetscape.gl';
import { XVIZ_STYLE, CAR } from './lib/constants';
import getDataFromXodr from '@/utils/getDataFromXodr';
import { createMapLayer } from '../mapEdit/lib/layers';
import { createTrafficLightLayer, createCarIconLayer } from './lib/layers';
import { formatSeconds } from '@/utils/tools';
import { ASSERT_SERVE } from '@/constants';
import lodash from 'lodash';
import Icon_arrow from '@/assets/images/obstacle_car.png';
import qs from 'qs';
import './style.less';

const exampleLog = require('./lib/log-from-stream').default;
let clickNum = 0;
let maxClickNum = 5;
let XVIDready = false;
let mapReady = false;
let renderFlag = true;
let carRenderFlag = true;
class Play extends PureComponent {
  state = {
    log: exampleLog,
    loading: false,
    mapData: {
      solidLines: [],
      brokenLines: [],
      referenceLines: [],
      arrowLayer: []
    },
    fileData: {},
    TrafficLightsData: [],
    carIconData: [],
    reRenderFlag: false,
    settings: {
      viewMode: 'PERSPECTIVE',
      showTooltip: false
    }
  };

  componentDidMount() {
    const that = this;
    this.state.log
      .on('ready', () => {
        console.log('ready');
        XVIDready = true;
        that.ready();
      })
      .on('error', console.error)
      .connect();
    this.getMapData();
  }

  getMapData = async () => {
    this.setState({
      loading: true
    });
    let prarms = qs.parse(lodash.split(window.location.search, '?')[1]);
    //加载地图
    const mapData = await getDataFromXodr(prarms.mapName);
    //加载红绿灯
    let fileData = {};
    if (prarms.trafficUrl && prarms.trafficUrl != 'null') {
      console.log(prarms.trafficUrl);
      fileData = await fetch(`${ASSERT_SERVE}/download/replay/${prarms.trafficUrl}`)
        .then((data) => {
          return data.text();
        })
        .then((file_text) => {
          return JSON.parse(file_text);
        });
    }
    console.log('map load');
    mapReady = true;
    if (mapData) {
      this.setState({
        mapData,
        fileData
      });
    }
    this.ready();
  };

  ready = () => {
    if (mapReady && XVIDready) {
      this.setState({
        loading: false
      });

      //自动播放
      const intervalId = setInterval(() => {
        clickNum++;
        console.log('click');
        if (
          document.getElementsByClassName('css-1eupenj') &&
          document.getElementsByClassName('css-1eupenj').length > 0
        ) {
          document.getElementsByClassName('css-1eupenj')[0].click();
          clearInterval(intervalId);
        }
        if (clickNum > maxClickNum) {
          clearInterval(intervalId);
        }
      }, 1000);
    }
  };

  _onSettingsChange = (changedSettings) => {
    this.setState({
      settings: { ...this.state.settings, ...changedSettings }
    });
  };

  //为了解决重新播放了  道路渲染出错的问题，从新渲染一下道路
  onPlay = (e) => {
    if (Number(e) < 0.2) {
      this.setState({
        reRenderFlag: !this.state.reRenderFlag
      });
    }
    this.getTrafficLightLayerData(Number(e));
    // this.getCarIconLayerData(Number(e));
  };

  //设置红绿灯
  getTrafficLightLayerData = (time) => {
    if (!renderFlag) {
      return;
    }
    renderFlag = false;
    //每秒变化一下红绿灯
    setTimeout(() => {
      renderFlag = true;
    }, 1000);
    const { fileData } = this.state;
    const { TrafficLightInfo } = fileData;
    if (!TrafficLightInfo) return;
    const { TrafficLights, states } = TrafficLightInfo;
    let nowState;
    for (let i = 0; i < states.length; i++) {
      if (states[i].t < time && time > states[i + 1].t) {
        nowState = states[i].sta;
      }
    }
    if (!nowState) {
      return [];
    }
    const result = [];
    for (let i = 0; i < TrafficLights.length; i++) {
      const tempPathData = [];
      for (let j = 0; j < TrafficLights[i].pos.length; j++) {
        tempPathData.push([TrafficLights[i].pos[j].x, TrafficLights[i].pos[j].y]);
      }
      const colorStr = nowState.charAt(TrafficLights[i].id).toUpperCase();
      let colorData = [];

      if (colorStr === 'R') {
        colorData = [255, 0, 0, 255];
      }
      if (colorStr === 'G') {
        colorData = [0, 255, 0, 255];
      }
      if (colorStr === 'Y') {
        colorData = [255, 255, 0, 255];
      }

      result.push({
        name: 'TrafficLights-' + TrafficLights[i].id,
        path: tempPathData,
        color: colorData
      });
    }
    this.setState({
      TrafficLightsData: result
    });
  };

  //设置车辆图标
  getCarIconLayerData = (time) => {
    if (!carRenderFlag) {
      return;
    }
    carRenderFlag = false;
    //每秒变化一下红绿灯
    setTimeout(() => {
      carRenderFlag = true;
    }, 1000);
    const result = [];
    result.push({
      coordinates: [10, time * 10, 3],
      angle: 180,
      icon: Icon_arrow,
      anchorY: 90,
      w: 200,
      h: 100,
      angle: 0
    });
    this.setState({
      carIconData: result
    });
  };

  render() {
    const { log, settings, mapData, loading, TrafficLightsData } = this.state;
    const layers = createMapLayer(mapData, false);
    const TrafficLightLayer = createTrafficLightLayer(TrafficLightsData);
    // const carIcon = createCarIconLayer(carIconData);
    layers.push(TrafficLightLayer);
    // layers.push(carIcon);
    return (
      <div className='play-wrap'>
        {loading ? (
          <div className='loading-mask'>
            <div>资源加载中，请稍等。。。</div>
          </div>
        ) : null}
        <div id='play-container'>
          <div id='control-panel'>
            <XVIZPanel log={log} name='Metrics' />
            <hr />
            <XVIZPanel log={log} name='Camera' />
            <hr />
          </div>
          <div id='log-panel'>
            <div id='map-view' style={{ backgroundColor: 'lightgray' }}>
              <LogViewer
                log={log}
                car={CAR}
                xvizStyles={XVIZ_STYLE}
                showTooltip={settings.showTooltip}
                viewMode={VIEW_MODE[settings.viewMode]}
                showMap={false}
                customLayers={layers}
              />
              <div id='hud'>
                {/* 转向 箭头 */}
                {/* <TurnSignalWidget log={log} streamName='/vehicle/turn_signal' /> */}
                {/* 红绿灯  red  yellow  green*/}
                <TrafficLightWidget log={log} streamName='/vehicle/traffic_light' />
                {/* 仪表盘 加速度 */}
                <MeterWidget
                  log={log}
                  streamName='/vehicle/acceleration'
                  style={{
                    arcRadius: 50
                  }}
                  className='hud-item'
                  label='Acceleration'
                  min={-10}
                  max={10}
                />
                <hr />
                {/* 仪表盘 速度 */}
                <MeterWidget
                  log={log}
                  streamName='/vehicle/velocity'
                  label='Speed'
                  // getWarning={(x) => (x > 6 ? 'FAST' : '')}
                  className='hud-item'
                  min={0}
                  max={200}
                />
                <hr />
                <MeterWidget
                  log={log}
                  streamName='/vehicle/throttle'
                  className='hud-item'
                  label='throttle'
                  min={0}
                  max={100}
                />
                <hr />
                <MeterWidget
                  log={log}
                  streamName='/vehicle/brake'
                  className='hud-item'
                  label='brake'
                  min={0}
                  max={100}
                />
                <hr />
                <MeterWidget
                  log={log}
                  streamName='/vehicle/steering'
                  className='hud-item'
                  label='steering'
                  min={-100}
                  max={100}
                />
              </div>
            </div>
            <div id='timeline'>
              <PlaybackControl
                width='100%'
                log={log}
                onSeek={this.onPlay}
                formatTimestamp={(x) => {
                  return formatSeconds(x);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Play;
