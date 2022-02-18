import { XVIZFileLoader } from 'streetscape.gl';

export default new XVIZFileLoader({
  timingsFilePath: 'http://localhost:8088/data.json',
  getFilePath: (index) =>
    `https://raw.githubusercontent.com/uber/xviz-data/master/kitti/2011_09_26_drive_0005_sync/${
      index + 1
    }-frame.glb`,
  worker: true,
  maxConcurrency: 4
});
