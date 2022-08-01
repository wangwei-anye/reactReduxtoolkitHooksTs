import { PathLayer, IconLayer } from '@deck.gl/layers';
import { COORDINATE_SYSTEM } from '@deck.gl/core';
//画地图上的红绿灯
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

//车辆贴图
export const createCarIconLayer = (carIconData) => {
  const carIconLayer = new IconLayer({
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [0, 0, 0],
    id: 'car-icon-reference',
    data: carIconData,
    getIcon: (d) => ({
      url: d.icon,
      anchorY: d.anchorY,
      width: d.w,
      height: d.h
    }),
    sizeUnits: 'meters',
    getPosition: (d) => d.coordinates,
    getSize: (d) => {
      return 1;
    },
    getAngle: (d) => {
      return parseInt(d.angle - 90);
    },
    zIndex: 50
  });

  return carIconLayer;
};
