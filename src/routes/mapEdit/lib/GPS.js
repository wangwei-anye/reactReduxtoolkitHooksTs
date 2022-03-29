export const GPS = {
  PI: 3.14159265358979324,
  x_pi: (3.14159265358979324 * 3000.0) / 180.0,
  //经纬度转换成米
  mercator_encrypt: function (lon, lat) {
    var y = (lat * 20037508.34) / 180;
    var x = Math.log(Math.tan(((90 + lon) * this.PI) / 360)) / (this.PI / 180);
    x = (x * 20037508.34) / 180;
    return { x: x, y: y };
  },
  //米转换成经纬度
  mercator_decrypt: function (x, y) {
    var lat = (y / 20037508.34) * 180;
    var lon = (x / 20037508.34) * 180;
    lon = (180 / this.PI) * (2 * Math.atan(Math.exp((lon * this.PI) / 180)) - this.PI / 2);
    return { lon: lon, lat: lat };
  }
};
