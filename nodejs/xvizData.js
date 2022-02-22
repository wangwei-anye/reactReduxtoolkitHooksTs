const xviz = require('@xviz/builder');
const getDeclarativeUI = require('./declarative-ui');
const axios = require('axios');

const XVIZBuilder = xviz.XVIZBuilder;
const XVIZMetadataBuilder = xviz.XVIZMetadataBuilder;

// 根据pos和radian计算polygon四个角的坐标
const calculatePlygon = (x, y, radian = 0, length = 4.5, width = 2) => {
  const distance = Math.sqrt(Math.pow(length, 2) + Math.pow(width, 2)) / 2;
  const angle = Math.PI - 2 * Math.atan(length / 2 / (width / 2));
  const polygon1X = x + Math.cos(radian + angle / 2) * distance;
  const polygon1Y = y + Math.sin(radian + angle / 2) * distance;
  const polygon3X = x - Math.cos(radian + angle / 2) * distance;
  const polygon3Y = y - Math.sin(radian + angle / 2) * distance;
  const polygon2X = x + Math.cos(radian - angle / 2) * distance;
  const polygon2Y = y + Math.sin(radian - angle / 2) * distance;
  const polygon4X = x - Math.cos(radian - angle / 2) * distance;
  const polygon4Y = y - Math.sin(radian - angle / 2) * distance;
  return [
    [polygon1X, polygon1Y],
    [polygon2X, polygon2Y],
    [polygon3X, polygon3Y],
    [polygon4X, polygon4Y]
  ];
};

async function buildXvizData(fileUrl) {
  const VEHICLE_POSE = '/vehicle_pose';
  const VEHICLE_ACCELERATION = '/vehicle/acceleration';
  const VEHICLE_VELOCITY = '/vehicle/velocity';
  const VEHICLE_TRAJECTORY = '/vehicle/trajectory';
  const VEHICLE_WHEEL = '/vehicle/wheel_angle';
  const VEHICLE_AUTONOMOUS = '/vehicle/automy_state';
  const TRACKLETS_TRACKING_POINT = '/tracklets/tracking_point';

  const resultData = await axios
    .get('http://192.168.113.109:8080/download/' + fileUrl)
    .then(function (response) {
      const jsondata = JSON.stringify(response.data);
      const autoCar = JSON.parse(jsondata).Vehicles[1];
      const obstacleCar = JSON.parse(jsondata).Vehicles[0];
      const timeLong = autoCar.pos[autoCar.pos.length - 1].timestamp;

      const xvizMetaBuilder = new XVIZMetadataBuilder();
      xvizMetaBuilder
        .startTime(0)
        .endTime(timeLong)

        .stream(VEHICLE_POSE)
        .category('pose')

        .stream(VEHICLE_ACCELERATION)
        .category('timeSeries')
        .type('float')
        .unit('m/s^2')

        .stream(VEHICLE_VELOCITY)
        .category('timeSeries')
        .type('float')
        .unit('km/h')

        .stream(VEHICLE_WHEEL)
        .category('timeSeries')
        .type('float')
        .unit('deg/s')

        //弹道
        .stream(VEHICLE_TRAJECTORY)
        .category('PRIMITIVE')
        .type('POLYLINE')
        .coordinate('IDENTITY')
        .streamStyle({
          stroke_color: '#00FA9A',
          stroke_width: 0.5 //弹道宽，
        })

        //障碍物
        .stream('/object/shape')
        .category('PRIMITIVE')
        .type('POLYGON')
        .coordinate('IDENTITY')
        .streamStyle({
          fill_color: '#FF6A6A',
          height: 2,
          extruded: true
        });

      xvizMetaBuilder.ui(getDeclarativeUI());

      const envelopdMsg = {
        type: 'xviz/metadata',
        data: xvizMetaBuilder.getMetadata()
      };

      const metaData = JSON.stringify(envelopdMsg);
      const resultArr = [metaData];

      obstacleCar.pos.forEach((element, index) => {
        const timestamp = element['timestamp'];
        const xvizBuilder = new XVIZBuilder();
        const posX = element.x;
        const posY = element.y;

        // 直接相加减计算坐标存在问题，没有考虑航向，导致障碍车车头角度不会变化
        // const polygon1 = [posX - lenght/2, posY - width/2, 0];
        // const polygon2 = [posX - lenght/2, posY + width/2, 0];
        // const polygon3 = [posX + lenght/2, posY + width/2, 0];
        // const polygon4 = [posX + lenght/2, posY - width/2, 0];
        const polygonPos = calculatePlygon(posX, posY, element.radian);

        xvizBuilder
          .pose(VEHICLE_POSE)
          .timestamp(timestamp)
          .mapOrigin(0, 0, 0) // 如需修改，客户端中地图coordinateOrigin需同步修改，复杂车辆和地图将无法匹配
          // .position(0, 0, 0)
          // .mapOrigin(114.064855, 22.672703, 0)
          .position(autoCar.pos[index].x, autoCar.pos[index].y, 0)
          .orientation(0, 0, autoCar.pos[index].radian);

        let acc = 0;
        let velocity = 0;
        if (autoCar.pos[index].acceleration > -9) {
          acc = autoCar.pos[index].acceleration;
          velocity = autoCar.pos[index].velocity;
        } else {
          acc = autoCar.pos[index].acceleration * 0.6;
          velocity = autoCar.pos[index].velocity * 0.6;
        }

        xvizBuilder.timeSeries(VEHICLE_ACCELERATION).timestamp(timestamp).value(acc);

        xvizBuilder.timeSeries(VEHICLE_VELOCITY).timestamp(timestamp).value(velocity);

        xvizBuilder.timeSeries(VEHICLE_WHEEL).timestamp(timestamp).value(autoCar.pos[index].radian);

        const line = [];
        autoCar.pos[index]['trajectory'].forEach((val) => {
          line.push([val.x, val.y, val.z]);
        });

        //弹道
        xvizBuilder.primitive(VEHICLE_TRAJECTORY).polyline(line).id('object-2');

        xvizBuilder.timeSeries('/velocity').timestamp(timestamp).value(autoCar.pos[index].velocity);
        //障碍物
        xvizBuilder.primitive('/object/shape').polygon(polygonPos).id('object-1');

        const msg = {
          type: 'xviz/state_update',
          data: xvizBuilder.getMessage()
        };
        const data = JSON.stringify(msg);
        resultArr.push(data);
      });
      return resultArr;
    })
    .catch(function (error) {
      console.log('error: get json file error');
      return [];
    });
  return resultData;
}
module.exports = buildXvizData;
