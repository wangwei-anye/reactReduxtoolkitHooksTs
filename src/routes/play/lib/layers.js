import { PathLayer } from '@deck.gl/layers';
import { COORDINATE_SYSTEM } from '@deck.gl/core';
//画地图
export const createTrafficLightLayer = (TrafficLightsData) => {
  const TrafficLightLayer = new PathLayer({
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [0, 0, 0],
    id: 'path-TrafficLight',
    rounded: true,
    data: TrafficLightsData,
    getColor: (d) => d.color,
    getWidth: (d) => 6,
    widthUnits: 'pixels',
    pickable: true,
    zIndex: 2
  });

  return TrafficLightLayer;
};
