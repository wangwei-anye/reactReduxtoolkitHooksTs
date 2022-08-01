import { GPS } from './GPS';
import getTrajectory from '@/utils/getTrajectory';
import { RESOURCE_TYPE } from './constant';

//获取图片缩放大小
export const getIconScale = (d) => {
  if (!d) {
    return 1;
  }
  if (d.type === RESOURCE_TYPE.MAIN_CAR || d.type === RESOURCE_TYPE.ELEMENT_CAR) {
    return d.length * 0.9;
  }
  if (d.type === RESOURCE_TYPE.ELEMENT_BICYCLE) {
    return d.length * 1.8;
  } else {
    return d.length * 4;
  }
  return 1;
};

//经纬度转换成角度
export const calcAngle = (startPoint, endPoint) => {
  const lng_a = startPoint[0];
  const lat_a = startPoint[1];
  const lng_b = endPoint[0];
  const lat_b = endPoint[1];

  var a = ((90 - lng_b) * Math.PI) / 180;
  var b = ((90 - lng_a) * Math.PI) / 180;
  var AOC_BOC = ((lat_b - lat_a) * Math.PI) / 180;
  var cosc = Math.cos(a) * Math.cos(b) + Math.sin(a) * Math.sin(b) * Math.cos(AOC_BOC);
  var sinc = Math.sqrt(1 - cosc * cosc);
  var sinA = (Math.sin(a) * Math.sin(AOC_BOC)) / sinc;
  var A = (Math.asin(sinA) * 180) / Math.PI;
  var res = 0;
  if (lat_b > lat_a && lng_b > lng_a) res = A;
  else if (lat_b > lat_a && lng_b < lng_a) res = 180 - A;
  else if (lat_b < lat_a && lng_b < lng_a) res = 180 - A;
  else if (lat_b < lat_a && lng_b > lng_a) res = 360 + A;
  else if (lat_b > lat_a && lng_b == lng_a) res = 90;
  else if (lat_b < lat_a && lng_b == lng_a) res = 270;
  else if (lat_b == lat_a && lng_b > lng_a) res = 0;
  else if (lat_b == lat_a && lng_b < lng_a) res = 180;
  return res;
};
//编辑数据 转换成 icon 点
export const formatIconDataFromFeatures = (featuresCollection) => {
  const result = [];
  for (let i = 0; i < featuresCollection.features.length; i++) {
    const len = featuresCollection.features[i].geometry.coordinates.length - 1;
    const type = featuresCollection.features[i].geometry.type;
    if (type === 'LineString') {
      for (let j = 0; j < featuresCollection.features[i].geometry.coordinates.length; j++) {
        if (j === len && j >= 1) {
          result.push({
            id: i + '-' + j,
            coordinates: featuresCollection.features[i].geometry.coordinates[j],
            angle: calcAngle(
              featuresCollection.features[i].geometry.coordinates[j - 1],
              featuresCollection.features[i].geometry.coordinates[j]
            )
          });
        } else {
          result.push({
            id: i + '-' + j,
            coordinates: featuresCollection.features[i].geometry.coordinates[j],
            angle: calcAngle(
              featuresCollection.features[i].geometry.coordinates[j],
              featuresCollection.features[i].geometry.coordinates[j + 1]
            )
          });
        }
      }
    } else if (type === 'Point') {
      result.push({
        id: i + '-point',
        coordinates: featuresCollection.features[i].geometry.coordinates,
        angle: 90
      });
    }
  }
  return result;
};
//编辑数据 转换成 贝塞尔点
const savetrajectotyArr = {}; //保存计算结果
export const getBezierPointFromFeatures = async (elementInfo, currentElementId) => {
  const result = [];
  for (let i = 0; i < elementInfo.length; i++) {
    if (!savetrajectotyArr[elementInfo[i].id] || currentElementId === elementInfo[i].id) {
      const pointsArr = [];
      if (elementInfo[i].type === RESOURCE_TYPE.MAIN_CAR) {
        //主车最后2个节点的线 不画
        if (elementInfo[i].routes.length > 2) {
          for (let j = 0; j < elementInfo[i].routes.length - 1; j++) {
            const meters = GPS.mercator_encrypt(
              elementInfo[i].routes[j].position.x,
              elementInfo[i].routes[j].position.y
            );
            pointsArr.push({
              x: meters.x,
              y: meters.y,
              heading: elementInfo[i].routes[j].heading
            });
          }
        }
      } else {
        for (let j = 0; j < elementInfo[i].routes.length; j++) {
          const meters = GPS.mercator_encrypt(
            elementInfo[i].routes[j].position.x,
            elementInfo[i].routes[j].position.y
          );
          pointsArr.push({
            x: meters.x,
            y: meters.y,
            heading: elementInfo[i].routes[j].heading
          });
        }
      }
      const trajectotyArr = await getTrajectory(pointsArr);
      savetrajectotyArr[elementInfo[i].id] = trajectotyArr;
      result.push(trajectotyArr);
    } else {
      result.push(savetrajectotyArr[elementInfo[i].id]);
    }
  }
  return result;
};

//根据点数组 计算 总长度
export const getTotalLenByPoint = (pointArr) => {
  let total = 0;
  for (let i = 0; i < pointArr.length - 1; i++) {
    const len = getLenByTwoPoint(pointArr[i], pointArr[i + 1]);
    total += len;
  }
  return total;
};

//主车数据 转换成 icon 点
export const formatIconDataFromInfo = (carData) => {
  if (!carData.routes) {
    return [];
  }
  const result = [];
  for (let i = 0; i < carData.routes.length; i++) {
    result.push({
      id: carData.id,
      type: carData.type,
      coordinates: [carData.routes[i].position.x, carData.routes[i].position.y],
      angle: i !== carData.routes.length - 1 || i == 0 ? carData.routes[i].heading : 0,
      icon:
        i !== carData.routes.length - 1 || i == 0
          ? carData.routes[i].selected
            ? carData.icon_select
            : carData.icon
          : carData.icon2,
      anchorY: i !== carData.routes.length - 1 || i == 0 ? carData.h / 2 : carData.h - 9, // 原点偏移量  h 一半
      w:
        i !== carData.routes.length - 1 || i == 0
          ? carData.routes[i].selected
            ? carData.selectW
            : carData.w
          : carData.h,
      h: carData.routes[i].selected ? carData.selectH : carData.h,
      length: carData.length,
      width: carData.width,
      index: carData.routes[i].index
    });
  }
  return result;
};
//元素数据 转换成 icon 点
export const formatIconDataFromElementInfo = (elementData) => {
  const result = [];
  for (let i = 0; i < elementData.length; i++) {
    for (let j = 0; j < elementData[i].routes.length; j++) {
      result.push({
        id: elementData[i].id,
        type: elementData[i].type,
        coordinates: [elementData[i].routes[j].position.x, elementData[i].routes[j].position.y],
        angle: elementData[i].routes[j].heading,
        icon: elementData[i].routes[j].selected ? elementData[i].icon_select : elementData[i].icon2,
        anchorY: elementData[i].h / 2, // 原点偏移量
        w: elementData[i].routes[j].selected ? elementData[i].selectW : elementData[i].w,
        h: elementData[i].routes[j].selected ? elementData[i].selectH : elementData[i].h,
        length: elementData[i].length,
        width: elementData[i].width,
        index: elementData[i].routes[j].index
      });
    }
  }
  return result;
};

//生成矩形的四个点
//x y 是经纬度
export const createRectangle = ([x, y], { width, height }) => {
  const meters = GPS.mercator_encrypt(x, y);
  const posArr = [];
  let pos = GPS.mercator_decrypt(meters.x - width / 2, meters.y - height / 2);
  posArr.push([pos.lon, pos.lat]);
  pos = GPS.mercator_decrypt(meters.x + width / 2, meters.y - height / 2);
  posArr.push([pos.lon, pos.lat]);
  pos = GPS.mercator_decrypt(meters.x + width / 2, meters.y + height / 2);
  posArr.push([pos.lon, pos.lat]);
  pos = GPS.mercator_decrypt(meters.x - width / 2, meters.y + height / 2);
  posArr.push([pos.lon, pos.lat]);
  pos = GPS.mercator_decrypt(meters.x - width / 2, meters.y - height / 2);
  posArr.push([pos.lon, pos.lat]);
  return posArr;
};

//根据矩形的坐标 计算中心 和 长宽
export const calcRectangle = (arr) => {
  const newArr = [];
  for (let i = 0; i < arr[0].length; i++) {
    newArr.push(GPS.mercator_encrypt(arr[0][i][0], arr[0][i][1]));
  }
  const obj = {};
  const pos = GPS.mercator_decrypt(
    (newArr[0].x + newArr[1].x) / 2,
    (newArr[1].y + newArr[2].y) / 2
  );
  obj.position = {
    x: pos.lon,
    y: pos.lat
  };
  obj.size = {
    width: parseFloat(Math.abs(newArr[1].x - newArr[0].x)).toFixed(2),
    height: parseFloat(Math.abs(newArr[2].y - newArr[1].y)).toFixed(2)
  };
  return obj;
};

// 返回最近的车道点 和角度
export const calcMinDistancePoint = (point, referenceLines) => {
  const meters = GPS.mercator_encrypt(point[0], point[1]);
  const startPoint = [meters.x, meters.y];
  let minLen = 9998;
  let minPoint = [];
  let minIndex = 0;
  let minSubIndex = 0;
  for (let i = 0; i < referenceLines.length; i++) {
    if (referenceLines[i].path.length >= 2) {
      for (let j = 0; j < referenceLines[i].path.length; j++) {
        const len = getLenByTwoPoint(startPoint, referenceLines[i].path[j]);
        if (len < minLen) {
          minLen = len;
          minPoint = referenceLines[i].path[j];
          minIndex = i;
          minSubIndex = j;
        }
      }
    }
  }
  let secondMinPoint = [];
  const minReference = referenceLines[minIndex].path;
  if (minSubIndex === minReference.length - 1) {
    minPoint = minReference[minSubIndex - 1];
    secondMinPoint = minReference[minSubIndex];
  } else {
    minPoint = minReference[minSubIndex];
    secondMinPoint = minReference[minSubIndex + 1];
  }
  const angle = getAngleByTwoPoint(minPoint, secondMinPoint);
  //到 车道的最短距离的焦点
  const jiaodian = getFocusPoint(minPoint, secondMinPoint, startPoint);
  const Lonlat = GPS.mercator_decrypt(jiaodian.x, jiaodian.y);
  // 到 车道的直线距离
  const minToRoad = getLenByTwoPoint(startPoint, [jiaodian.x, jiaodian.y]);
  if (minToRoad < 3) {
    return [[Lonlat.lon, Lonlat.lat], angle, true];
  }
  return [point, angle, false];
};

function getFocusPoint([x1, y1], [x2, y2], [x3, y3]) {
  let P = {};
  if (x1 - x2 == 0) {
    P.x = x1;
    P.y = y3;
  } else {
    let A = (y1 - y2) / (x1 - x2);
    let B = y1 - A * x1;
    let m = x3 + A * y3;

    P.x = (m - A * B) / (A * A + 1);
    P.y = A * P.x + B;
  }
  return P;
}

//计算2点之间的角度
export const getAngleByTwoPoint = (point1, point2) => {
  if (point1.length !== 2 || point2.length !== 2) {
    return 0;
  }
  const radian = Math.atan2(point2[1] - point1[1], point2[0] - point1[0]); // 返回来的是弧度
  const angle = parseInt((180 / Math.PI) * radian); // 根据弧度计算角度
  return angle;
};

//计算2点之间的距离
export const getLenByTwoPoint = (point1, point2) => {
  if (point1.length !== 2 || point2.length !== 2) {
    return 0;
  }
  const a = Math.abs(point1[0] - point2[0]);
  const b = Math.abs(point1[1] - point2[1]);
  return Math.sqrt(a * a + b * b);
};

//生成旋转用的虚拟坐标
export const createRotatePoint = ([x, y], heading, type) => {
  let len;
  if (type == RESOURCE_TYPE.MAIN_CAR || type === RESOURCE_TYPE.ELEMENT_CAR) {
    len = 4;
  } else if (type == RESOURCE_TYPE.ELEMENT_BICYCLE) {
    len = 4.3;
  } else {
    len = 4;
  }
  const meters = GPS.mercator_encrypt(x, y);
  const _heading = heading % 360;
  let result = [];
  if (_heading === 0) {
    result = [meters.x + len, meters.y];
  } else if (_heading === 90 || _heading === -270) {
    result = [meters.x, meters.y + len];
  } else if (_heading === 180 || _heading === -180) {
    result = [meters.x - len, meters.y];
  } else if (_heading === 270 || _heading === -90) {
    result = [meters.x, meters.y - len];
  } else {
    const radian = ((2 * Math.PI) / 360) * _heading;
    const _y = Math.sin(radian) * len;
    const _x = Math.cos(radian) * len;
    result = [meters.x + _x, meters.y + _y];
  }
  const pos = GPS.mercator_decrypt(result[0], result[1]);
  return [pos.lon, pos.lat];
};

//根据路径 和 时间 计算  到什么位置
// 计算贝塞尔曲线  保存值，避免重复计算
let calcAjectoryResult = {};
export const getPointByRouterAndTime = async (router, time) => {
  if (router.length < 2) {
    return {};
  }
  //大的节点
  let startPoint;
  let endPoint;
  for (let i = 0; i < router.length; i++) {
    const meters = GPS.mercator_encrypt(router[i].position.x, router[i].position.y);
    router[i].meterPosition = { x: meters.x, y: meters.y };
    if (i > 0 && time <= router[i].time && time > router[i - 1].time) {
      startPoint = router[i - 1];
      endPoint = router[i];
    }
  }
  //超过全部  设最后2个点
  if (time > router[router.length - 1].time) {
    startPoint = router[router.length - 2];
    endPoint = router[router.length - 1];
  }

  if (!startPoint || !endPoint) {
    return [];
  }

  const _v0 = startPoint.velocity;
  const _acc = endPoint.accelerate;
  const _t = time - startPoint.time;
  //大节点里的 移动距离
  let moveLen = _v0 * _t + 0.5 * _acc * _t * _t;

  let trajectotyArr;
  //缓存计算结果
  const keyId = `${startPoint.meterPosition.x}*${startPoint.meterPosition.y}*${startPoint.heading}*${endPoint.meterPosition.x}*${endPoint.meterPosition.y}*${endPoint.heading}`;
  if (calcAjectoryResult[keyId]) {
    trajectotyArr = calcAjectoryResult[keyId];
  } else {
    trajectotyArr = await getTrajectory([
      {
        x: startPoint.meterPosition.x,
        y: startPoint.meterPosition.y,
        heading: startPoint.heading
      },
      {
        x: endPoint.meterPosition.x,
        y: endPoint.meterPosition.y,
        heading: endPoint.heading
      }
    ]);
    calcAjectoryResult[keyId] = trajectotyArr;
  }
  if (trajectotyArr.length < 2) {
    trajectotyArr = [
      [startPoint.meterPosition.x, startPoint.meterPosition.y],
      [endPoint.meterPosition.x, endPoint.meterPosition.y]
    ];
  }
  //贝塞尔曲线里的小节点
  let startNode;
  let endNode;
  //小节点里的 移动距离
  let nodeMoveLen;
  let total = 0;
  for (let i = 0; i < trajectotyArr.length - 1; i++) {
    const len = getLenByTwoPoint(trajectotyArr[i], trajectotyArr[i + 1]);
    total += len;
    if (moveLen <= total) {
      startNode = trajectotyArr[i];
      endNode = trajectotyArr[i + 1];
      nodeMoveLen = moveLen - (total - len);
      break;
    }
  }

  //超出距离  设置停在最后节点
  if (moveLen > total) {
    startNode = trajectotyArr[trajectotyArr.length - 2];
    endNode = trajectotyArr[trajectotyArr.length - 1];
  }
  const _s = getLenByTwoPoint(startNode, endNode);
  if (moveLen > total) {
    nodeMoveLen = _s;
  }

  const targetPoint = getTargetByTwoPointAndLen(startNode, endNode, _s, nodeMoveLen);
  const angle = getAngleByTwoPoint(startNode, endNode);
  const pos = GPS.mercator_decrypt(targetPoint[0], targetPoint[1]);

  return {
    coordinates: [pos.lon, pos.lat],
    angle: angle
  };
};

//根据两点坐标、移动距离  算出目标点坐标
export const getTargetByTwoPointAndLen = (point1, point2, pointLen, movelen) => {
  const x = point1[0] + (point2[0] - point1[0]) * (movelen / pointLen);
  const y = point1[1] + (point2[1] - point1[1]) * (movelen / pointLen);
  return [x, y];
};

//根据初始速度、结束速度、距离  算出时间和 加速度
export const getTimeAndAccByLen = (_v0, _vt, _s) => {
  const _t = _s / (_v0 + (_vt - _v0) / 2);
  const acc = (_vt - _v0) / _t;
  return [_t, acc];
};

//判断 一个 点  是否在 触发器矩形内
export const isInTrigger = (trigger, coordinates) => {
  const pointMeters = GPS.mercator_encrypt(coordinates[0], coordinates[1]);

  const triggerMeters = GPS.mercator_encrypt(trigger.position.x, trigger.position.y);
  const width = parseFloat(trigger.size.width);
  const height = parseFloat(trigger.size.height);
  if (pointMeters.x > triggerMeters.x - width / 2 && pointMeters.x < triggerMeters.x + width / 2) {
    if (
      pointMeters.y > triggerMeters.y - height / 2 &&
      pointMeters.y < triggerMeters.y + height / 2
    ) {
      return true;
    }
  }
  return false;
};
