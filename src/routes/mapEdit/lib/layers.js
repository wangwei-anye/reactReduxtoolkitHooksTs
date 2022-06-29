import { PathLayer, IconLayer } from '@deck.gl/layers';
import { COORDINATE_SYSTEM } from '@deck.gl/core';
import { PathStyleExtension } from '@deck.gl/extensions';
import { getIconScale, getAngleByTwoPoint } from './utils';
//画地图
export const createMapLayer = (mapData, isShowArrow = true) => {
  if (!mapData) {
    return [];
  }
  const solidLayer = new PathLayer({
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [0, 0, 0],
    id: 'path-layer-solid',
    rounded: true,
    data: mapData.solidLines,
    getColor: (d) => d.color, //[255, 255, 255, 255],
    getWidth: (d) => 2,
    widthUnits: 'pixels',
    pickable: true,
    zIndex: 2
  });
  const brokenLayer = new PathLayer({
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [0, 0, 0],
    id: 'path-layer-broken',
    rounded: true,
    data: mapData.brokenLines,
    getColor: (d) => d.color, //[255, 255, 255, 255],
    getWidth: 2,
    widthUnits: 'pixels',
    getDashArray: [30, 60], //虚线   实线/总长度
    dashJustified: true,
    pickable: true,
    zIndex: 1,
    extensions: [new PathStyleExtension({ dash: true, highPrecisionDash: true })]
  });
  const referenceLayer = new PathLayer({
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [0, 0, 0],
    id: 'path-layer-reference',
    rounded: true,
    capRounded: false,
    data: mapData.referenceLines,
    // getColor: [178, 178, 178, 255],
    getColor: [59, 61, 64, 255],
    getWidth: 3.8,
    widthUnits: 'meters',
    pickable: true,
    zIndex: -1
  });
  if (isShowArrow) {
    for (let i = 0; i < mapData.arrowLayer.length; i++) {
      mapData.arrowLayer[i].angle = getAngleByTwoPoint(
        mapData.arrowLayer[i].angleArr[0],
        mapData.arrowLayer[i].angleArr[1]
      );
    }
    const arrowLayer = new IconLayer({
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [0, 0, 0],
      id: 'arrow-layer-reference',
      data: mapData.arrowLayer,
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
      zIndex: 20
    });
    return [referenceLayer, solidLayer, brokenLayer, arrowLayer];
  }
  return [referenceLayer, solidLayer, brokenLayer];
};
//画车 和 障碍物
export const createCarIconLayer = (id, data, clickCallback) => {
  return new IconLayer({
    id,
    pickable: true,
    data,
    getIcon: (d) => ({
      url: d.icon,
      anchorY: d.anchorY,
      width: d.w,
      height: d.h
    }),
    sizeUnits: 'meters',
    onClick: (d) => {
      if (d && d.object && clickCallback) {
        clickCallback(d.object.type, d.object.id, d.object.index);
      }
    },
    getPosition: (d) => d.coordinates,
    getSize: (d) => {
      return getIconScale(d);
    },
    getAngle: (d) => {
      return parseInt(d.angle);
    },
    zIndex: 15
  });
};
//贝塞尔曲线绘画
export const createRouterLayer = (id, data) => {
  return new PathLayer({
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [0, 0, 0],
    id,
    data,
    widthUnits: 'pixels',
    rounded: true,
    getWidth: (d) => 2,
    getColor: (d) => [0, 0, 255],
    getPath: (d) => d.path,
    zIndex: 4
  });
};
