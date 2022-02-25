import { PathLayer, IconLayer } from '@deck.gl/layers';
import { COORDINATE_SYSTEM } from '@deck.gl/core';
import { PathStyleExtension } from '@deck.gl/extensions';
import { getIconScale } from './utils';
import VehicleImg from '../../../assets/images/vehicle.png';
//画地图
export const createMapLayer = (mapData) => {
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
    getColor: (d) => [255, 0, 0]
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
const ICON_MAPPING = {
  // 类似css 里的 background-image:position  width
  marker: { x: 0, y: 0, width: 200, height: 99, mask: false },
  marker2: { x: 0, y: 0, width: 200, height: 99, mask: false }
};

//画车
// [{"id":"0-0","coordinates":[0.004323616998977707,0.005716400778050557],"angle":280.4691786762281},
// {"id":"0-1","coordinates":[0.0049072659425258795,0.0025578310250940596],"angle":285.1479218678896}]

export const createCarIconLayer = (id, data, mapZoom) => {
  return new IconLayer({
    id,
    pickable: true,
    data,
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
    onClick: () => {
      console.log(1111111);
    },
    getPosition: (d) => d.coordinates,
    getSize: (d) => 5,
    getAngle: (d) => d.angle
  });
};
//贝塞尔曲线绘画
export const createRouterLayer = (id, data) => {
  return new PathLayer({
    id,
    data,
    widthUnits: 'pixels',
    rounded: true,
    opacity: 0.5,
    getWidth: (d) => 10,
    getColor: (d) => [0, 255, 0],
    getPath: (d) => d.path
  });
};
