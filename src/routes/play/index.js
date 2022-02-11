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

const TIMEFORMAT_SCALE = getXVIZConfig().TIMESTAMP_FORMAT === 'seconds' ? 1000 : 1;
const exampleLog = require('./lib/log-from-stream').default;

class Example extends PureComponent {
  state = {
    log: exampleLog,
    layers: [],
    settings: {
      viewMode: 'PERSPECTIVE',
      showTooltip: false
    }
  };

  componentDidMount() {
    this.state.log.on('error', console.error).connect();
    this.getData();
  }
  getData = async () => {
    const params = new URLSearchParams(window.location.search);
    const mapData = await getMapData(params.get('mapName'));
    console.log(mapData);
    const temp1 = new PathLayer({
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [0, 0, 0],
      id: 'path-layer-solid',
      widthUnits: 'pixels',
      rounded: true,
      data: mapData.solidLines,
      getColor: (d) => [80, 88, 98],
      getTooltip: (e) => {
        console.log(111);
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
    let layers = [
      // 高精地图图层
      temp1,
      temp2
      // new PathLayer({
      //   coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      //   coordinateOrigin: [0, 0, 0],
      //   id: 'path-layer-lanes',
      //   widthUnits: 'pixels',
      //   rounded: true,
      //   data: mapData.pointLines,
      //   getColor: d => [80, 88, 98]
      // })
    ];
    this.setState({
      layers
    });
  };

  _onSettingsChange = (changedSettings) => {
    this.setState({
      settings: { ...this.state.settings, ...changedSettings }
    });
  };

  render() {
    const { log, settings, layers } = this.state;

    return (
      <div id='play-container'>
        <div id='control-panel'>
          <XVIZPanel log={log} name='Metrics' />
          <hr />
          <XVIZPanel log={log} name='Camera' />
          <hr />
          <Form
            data={APP_SETTINGS}
            values={this.state.settings}
            onChange={this._onSettingsChange}
          />
          <StreamSettingsPanel log={log} />
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
              formatTimestamp={(x) => new Date(x * TIMEFORMAT_SCALE).toUTCString()}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Example;
