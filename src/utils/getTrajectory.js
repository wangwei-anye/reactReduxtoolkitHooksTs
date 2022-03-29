import { libtrajectory } from './libtrajectory';
export default function (arr) {
  return libtrajectory()().then((Module) => {
    var pointRouter = new Module.vectorRoutePoint();
    for (let i = 0; i < arr.length; i++) {
      pointRouter.push_back(arr[i]);
    }
    var result = [];
    //0:回旋曲线   1:贝塞尔曲线
    var ts = Module.getAllTrajectoryPoints(1, pointRouter);
    for (let i = 0; i < ts.size(); i++) {
      for (let j = 0; j < ts.get(i).size(); j++) {
        result.push([ts.get(i).get(j).x, ts.get(i).get(j).y]);
      }
    }
    pointRouter.delete();
    return result;
  });
}
