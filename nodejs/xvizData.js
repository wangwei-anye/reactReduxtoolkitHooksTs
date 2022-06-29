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
  const VEHICLE_THROTTLE = '/vehicle/throttle';
  const VEHICLE_BRAKE = '/vehicle/brake';
  const VEHICLE_STEERING = '/vehicle/steering';
  const VEHICLE_TRAJECTORY = '/vehicle/trajectory';
  const TRAFFIC_LIGHT = '/vehicle/traffic_light';
  const VEHICLE_WHEEL = '/vehicle/wheel_angle';
  try {
    const resultData = await axios
      .get(fileUrl)
      .then(function (response) {
        const jsondata = response.data;
        let autoCar = {};
        let obstacleCarArr = [];
        if (jsondata.Vehicles.length === 0) {
          return [];
        }
        for (let i = 0; i < jsondata.Vehicles.length; i++) {
          if (jsondata.Vehicles[i].id === 0) {
            //主车
            autoCar = jsondata.Vehicles[i];
          } else {
            //障碍车
            obstacleCarArr.push(jsondata.Vehicles[i]);
          }
        }
        const timeLong = autoCar.pos[autoCar.pos.length - 1].t;

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

          .stream(VEHICLE_THROTTLE)
          .category('timeSeries')
          .type('float')
          .unit('')

          .stream(VEHICLE_BRAKE)
          .category('timeSeries')
          .type('float')
          .unit('')

          .stream(VEHICLE_STEERING)
          .category('timeSeries')
          .type('float')
          .unit('')

          .stream(VEHICLE_WHEEL)
          .category('timeSeries')
          .type('float')
          .unit('deg/s')

          .stream(TRAFFIC_LIGHT)
          .category('timeSeries')
          .type('')
          .unit('')

          //弹道
          .stream(VEHICLE_TRAJECTORY)
          .category('PRIMITIVE')
          .type('POLYLINE')
          .coordinate('IDENTITY')
          .streamStyle({
            stroke_color: '#00FF00',
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

        autoCar.pos.forEach((item, index) => {
          const timestamp = item['t'];
          const xvizBuilder = new XVIZBuilder();
          xvizBuilder
            .pose(VEHICLE_POSE)
            .timestamp(timestamp)
            .mapOrigin(0, 0, 0) // 如需修改，客户端中地图coordinateOrigin需同步修改，复杂车辆和地图将无法匹配
            // .position(0, 0, 0)
            // .mapOrigin(114.064855, 22.672703, 0)
            .position(item.x, item.y, 0)
            .orientation(0, 0, item.rad); // roll : 旋转角度   pitch:上下角度  yaw : 左右角度

          //右上角 红绿灯
          let traffic_light = '';
          if (item.tfl && item.tfl.length > 0) {
            traffic_light = item.tfl[0].sta;
            if (traffic_light.toUpperCase() === 'R') {
              traffic_light = 'red';
            }
            if (traffic_light.toUpperCase() === 'G') {
              traffic_light = 'green';
            }
            if (traffic_light.toUpperCase() === 'Y') {
              traffic_light = 'yellow';
            }
          }
          xvizBuilder.timeSeries(TRAFFIC_LIGHT).timestamp(timestamp).value(traffic_light);

          //加速度
          xvizBuilder.timeSeries(VEHICLE_ACCELERATION).timestamp(timestamp).value(item.a);
          //速度
          xvizBuilder
            .timeSeries(VEHICLE_VELOCITY)
            .timestamp(timestamp)
            .value(item.v * 3.6); //   m/s转换成 km/h
          xvizBuilder
            .timeSeries(VEHICLE_THROTTLE)
            .timestamp(timestamp)
            .value(item.th || 0);
          xvizBuilder
            .timeSeries(VEHICLE_BRAKE)
            .timestamp(timestamp)
            .value(item.br || 0);
          xvizBuilder
            .timeSeries(VEHICLE_STEERING)
            .timestamp(timestamp)
            .value(item.str || 0);

          xvizBuilder.timeSeries(VEHICLE_WHEEL).timestamp(timestamp).value(item.rad);

          const line = [];
          item['tra'].forEach((val) => {
            line.push([val.x, val.y, val.z]);
          });

          //弹道
          xvizBuilder.primitive(VEHICLE_TRAJECTORY).polyline(line).id('object-2');

          //旧代码有的  不知道作用 先注释
          // xvizBuilder.timeSeries('/velocity').timestamp(timestamp).value(item.v);

          //障碍物 列表
          for (let k = 0; k < obstacleCarArr.length; k++) {
            const obstacleCarPosLen = obstacleCarArr[k].pos.length;
            for (let p = 0; p < obstacleCarPosLen; p++) {
              if (obstacleCarArr[k].pos[p].idx === item.idx) {
                const posX = obstacleCarArr[k].pos[p].x;
                const posY = obstacleCarArr[k].pos[p].y;
                const polygonPos = calculatePlygon(
                  posX,
                  posY,
                  obstacleCarArr[k].pos[p].rad,
                  obstacleCarArr[k].l,
                  obstacleCarArr[k].w
                );
                xvizBuilder
                  .primitive('/object/shape')
                  .polygon(polygonPos)
                  .style({
                    height: obstacleCarArr[k].h
                  })
                  .id('polygon-' + k);
                break;
              }
            }
          }

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
        console.log('error: get json file error ' + new Date().toLocaleString());
        return [];
      });
    return resultData;
  } catch (error) {}
}
module.exports = buildXvizData;
