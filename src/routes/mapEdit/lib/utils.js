//anchorpoints：贝塞尔基点
//pointsAmount：生成的点数
export const CreateBezierPoints = (anchorpoints, pointsAmount) => {
  var points = [];
  for (var i = 0; i < pointsAmount; i++) {
    var point = MultiPointBezier(anchorpoints, i / pointsAmount);
    points.push(point);
  }
  return points;
};

export const MultiPointBezier = (points, t) => {
  var len = points.length;
  var x = 0,
    y = 0;
  var erxiangshi = function (start, end) {
    var cs = 1,
      bcs = 1;
    while (end > 0) {
      cs *= start;
      bcs *= end;
      start--;
      end--;
    }
    return cs / bcs;
  };
  for (var i = 0; i < len; i++) {
    var point = points[i];
    x += point.x * Math.pow(1 - t, len - 1 - i) * Math.pow(t, i) * erxiangshi(len - 1, i);
    y += point.y * Math.pow(1 - t, len - 1 - i) * Math.pow(t, i) * erxiangshi(len - 1, i);
  }
  return { x: x, y: y };
};

//获取图片缩放大小
export const getIconScale = (zoom) => {
  return (zoom - 10) * 0.8;
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
    if (type !== 'LineString') {
      break;
    }
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
  }
  return result;
};
//编辑数据 转换成 贝塞尔点
export const getBezierPointFromFeatures = (featuresCollection) => {
  const pointsArr = [];
  for (let i = 0; i < featuresCollection.features.length; i++) {
    const type = featuresCollection.features[i].geometry.type;
    if (type !== 'LineString') {
      break;
    }
    const points = [];
    for (let j = 0; j < featuresCollection.features[i].geometry.coordinates.length; j++) {
      points.push({
        x: featuresCollection.features[i].geometry.coordinates[j][0],
        y: featuresCollection.features[i].geometry.coordinates[j][1]
      });
    }
    pointsArr.push(points);
  }
  const totalResult = [];
  for (let i = 0; i < pointsArr.length; i++) {
    const tempArr = CreateBezierPoints(pointsArr[i], 40);
    const result = [];
    for (let j = 0; j < tempArr.length; j++) {
      result.push([tempArr[j].x, tempArr[j].y]);
    }
    totalResult.push(result);
  }
  return totalResult;
};
