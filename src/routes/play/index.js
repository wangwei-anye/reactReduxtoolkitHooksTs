import React, { PureComponent } from 'react';
import { Spin } from 'antd';

import { getXVIZConfig } from '@xviz/parser';
import {
  LogViewer,
  PlaybackControl,
  StreamSettingsPanel,
  MeterWidget,
  TrafficLightWidget,
  TurnSignalWidget,
  XVIZPanel,
  VIEW_MODE
} from 'streetscape.gl';
import { Form } from '@streetscape.gl/monochrome';
import { PathLayer, GeoJsonLayer } from '@deck.gl/layers';
import { PathStyleExtension } from '@deck.gl/extensions';
import { COORDINATE_SYSTEM } from '@deck.gl/core';
import { APP_SETTINGS, MAPBOX_TOKEN, MAP_STYLE, XVIZ_STYLE, CAR } from './lib/constants';
import getDataFromXodr from '@/utils/getDataFromXodr';
import './style.less';

const TIMEFORMAT_SCALE = getXVIZConfig().TIMESTAMP_FORMAT === 'seconds' ? 1000 : 1;
const exampleLog = require('./lib/log-from-stream').default;
let clickNum = 0;
class Play extends PureComponent {
  state = {
    log: exampleLog,
    loading: false,
    mapData: {
      solidLines: [],
      dashedLines: []
    },
    reRenderFlag: false,
    settings: {
      viewMode: 'PERSPECTIVE',
      showTooltip: false
    }
  };

  componentDidMount() {
    this.state.log.on('error', console.error).connect();
    this.getData();
    // console.log(getXVIZConfig());
  }
  getData = async () => {
    this.setState({
      loading: true
    });
    const mapData = await getDataFromXodr();
    console.log(mapData);
    setTimeout(() => {
      this.setState({
        loading: false
      });
    }, 1000);
    if (mapData) {
      this.setState({
        mapData
      });
    }
    //自动播放
    const intervalId = setInterval(() => {
      clickNum++;
      if (
        document.getElementsByClassName('css-1eupenj') &&
        document.getElementsByClassName('css-1eupenj').length > 0
      ) {
        document.getElementsByClassName('css-1eupenj')[0].click();
        clearInterval(intervalId);
      }
      if (clickNum > 3) {
        clearInterval(intervalId);
      }
    }, 1000);
  };

  renderLayer = (mapData) => {
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
  };

  render() {
    const { log, settings, mapData, loading } = this.state;
    const layers = this.renderLayer(mapData);
    return (
      <div className='play-wrap'>
        {loading ? (
          <div className='loading-mask'>
            <div>地图加载中，请稍等。。。</div>
          </div>
        ) : null}
        <div id='play-container'>
          <div id='control-panel'>
            <XVIZPanel log={log} name='Metrics' />
            <hr />
            <XVIZPanel log={log} name='Camera' />
            <hr />
            {/* <Form
            data={APP_SETTINGS}
            values={this.state.settings}
            onChange={this._onSettingsChange}
          />
          <StreamSettingsPanel log={log} /> */}
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
                <TurnSignalWidget log={log} streamName='/vehicle/turn_signal' />
                <hr />
                <TrafficLightWidget log={log} streamName='/vehicle/traffic_light' />
                <hr />
                <MeterWidget
                  log={log}
                  streamName='/vehicle/acceleration'
                  style={{
                    arcRadius: 50
                  }}
                  label='Acceleration'
                  min={-4}
                  max={4}
                />
                <hr />
                <MeterWidget
                  log={log}
                  streamName='/vehicle/velocity'
                  label='Speed'
                  getWarning={(x) => (x > 6 ? 'FAST' : '')}
                  min={0}
                  max={20}
                />
              </div>
            </div>
            <div id='timeline'>
              <PlaybackControl
                width='100%'
                log={log}
                onSeek={this.onPlay}
                formatTimestamp={(x) => x}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Play;
