import React, { PureComponent } from 'react';
import { render } from 'react-dom';

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
import { getMapData } from './lib/requestData';
import './style.less';
import json from './lib/template-236.json';

const TIMEFORMAT_SCALE = getXVIZConfig().TIMESTAMP_FORMAT === 'seconds' ? 1000 : 1;
const exampleLog = require('./lib/log-from-stream').default;
class Play extends PureComponent {
  state = {
    log: exampleLog,
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
    // json.Vehicles[0].pos.length = 100;
    // json.Vehicles[1].pos.length = 100;
    // console.log(JSON.stringify(json));
    console.log(getXVIZConfig());
  }
  getData = async () => {
    const params = new URLSearchParams(window.location.search);
    const mapData = await getMapData(params.get('mapName'));
    console.log(mapData);
    this.setState({
      mapData
    });
  };

  renderLayer = (mapData) => {
    const temp1 = new PathLayer({
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [0, 0, 0],
      id: 'path-layer-solid',
      widthUnits: 'pixels',
      rounded: true,
      data: mapData.solidLines,
      getColor: (d) => [80, 88, 98],
      getTooltip: (e) => {
        return '1111111';
      }
    });
    const temp2 = new PathLayer({
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [0, 0, 0],
      id: 'path-layer-dashed',
      widthUnits: 'pixels',
      rounded: true,
      data: mapData.dashedLines,
      getColor: (d) => [80, 88, 98],
      getDashArray: [120, 300],
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
    const { log, settings, mapData } = this.state;
    const layers = this.renderLayer(mapData);
    return (
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
    );
  }
}

export default Play;
