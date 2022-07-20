import { libtrajectory } from './libtrajectory';

let Module = null;
const getModule = async () => {
  return libtrajectory()().then((Module) => {
    return Module;
  });
};

export default async function (arr) {
  let M;
  if (Module) {
    M = Module;
  } else {
    Module = await getModule();
    M = Module;
  }
  var pointRouter = new M.vectorRoutePoint();
  for (let i = 0; i < arr.length; i++) {
    pointRouter.push_back(arr[i]);
  }
  var result = [];
  //0:回旋曲线   1:贝塞尔曲线
  var ts = M.getAllTrajectoryPoints(1, pointRouter);
  for (let i = 0; i < ts.size(); i++) {
    for (let j = 0; j < ts.get(i).size(); j++) {
      result.push([ts.get(i).get(j).x, ts.get(i).get(j).y]);
    }
  }
  pointRouter.delete();
  return result;
}
