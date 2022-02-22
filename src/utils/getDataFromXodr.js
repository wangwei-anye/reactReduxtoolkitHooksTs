import { libjsesmini } from './libjsesmini';
import { ASSERT_SERVE } from '@/constants';
export default function (url) {
  return libjsesmini()().then((Module) => {
    // return fetch('./e6mini.xodr', {
    return fetch(`${ASSERT_SERVE}/download/outOP210225.xodr`, {
      method: 'GET',
      mode: 'cors'
    })
      .then((file_data) => {
        return file_data.text();
      })
      .then((file_text) => {
        Module['FS_createDataFile']('.', 'e6mini.xodr', file_text, true, true);
        var isLoad = Module.Position.LoadOpenDrivePath('./e6mini.xodr');

        var totalLines = {
          solidLines: [],
          brokenLines: []
        };

        var od = Module.Position.GetOpenDrive();
        for (var r = 0; r < od.GetNumOfRoads(); r++) {
          //new a road
          var road = od.GetRoadByIdx(r);
          for (var i = 0; i < road.GetNumberOfLaneSections(); i++) {
            var lane_section = road.GetLaneSectionByIdx(i);
            for (var j = 0; j < lane_section.GetNumberOfLanes(); j++) {
              var lane = lane_section.GetLaneByIdx(j);

              /***************/
              for (var k = 0; k < lane.GetNumberOfRoadMarks(); k++) {
                var lane_roadmark = lane.GetLaneRoadMarkByIdx(k);
                for (var m = 0; m < lane_roadmark.GetNumberOfRoadMarkTypes(); m++) {
                  var lane_roadmarktype = lane_roadmark.GetLaneRoadMarkTypeByIdx(m);
                  for (var n = 0; n < lane_roadmarktype.GetNumberOfRoadMarkTypeLines(); n++) {
                    var lane_roadmarktypeline = lane_roadmarktype.GetLaneRoadMarkTypeLineByIdx(n);
                    var curr_osi_rm = lane_roadmarktypeline.GetOSIPoints();
                    var roadmarkColor = lane_roadmark.GetColorInt(); //RoadMarkColor
                    if (roadmarkColor == Module.RoadMarkColor.YELLOW) {
                      //黄线
                    } else {
                    }
                    /*
                      enum RoadMarkColor{
                        STANDARD_COLOR, // equivalent to white
                        BLUE,GREEN,RED,WHITE,YELLOW
                      };
                      enum RoadMarkType{
                        NONE_TYPE = 1,SOLID = 2,BROKEN = 3,SOLID_SOLID = 4,SOLID_BROKEN = 5,BROKEN_SOLID = 6,
                        BROKEN_BROKEN = 7,BOTTS_DOTS = 8,GRASS = 9,CURB = 10
                      };
                      */
                    var roadmarkType = lane_roadmark.GetType();

                    if (roadmarkType == Module.RoadMarkType.BROKEN) {
                      //虚线
                      var brokenLineObj = {
                        name: 'brokenLine' + r + '-' + i + '-' + j + '-' + k + '-' + m + '-' + n,
                        color: '#ed1c24',
                        getWidth: (d) => 2, //pixels
                        path: []
                      };
                      var points = curr_osi_rm.GetPoints();
                      var pathResult = [];
                      for (var q = 0; q < points.size(); q++) {
                        var point = curr_osi_rm.GetPoint(q);
                        pathResult.push([point.x, point.y]);
                      }
                      brokenLineObj.path = pathResult;
                      totalLines.brokenLines.push(brokenLineObj);
                    } else if (roadmarkType == Module.RoadMarkType.SOLID) {
                      //实线
                      var solidLineObj = {
                        name: 'solidLine' + r + '-' + i + '-' + j + '-' + k + '-' + m + '-' + n,
                        color: '#ed1c24',
                        getWidth: (d) => 2,
                        path: []
                      };

                      var points = curr_osi_rm.GetPoints();
                      var pathResult = [];
                      for (var q = 0; q < points.size(); q++) {
                        var point = curr_osi_rm.GetPoint(q);
                        pathResult.push([point.x, point.y]);
                      }
                      solidLineObj.path = pathResult;
                      totalLines.solidLines.push(solidLineObj);
                    } else {
                      console.log('roadmarkType:-------->' + roadmarkType);
                    }
                  }
                }
              }
              /*************/
              if (lane.IsDriving() == false || lane.GetId() == 0) {
                continue;
              }

              /*****reference line*****************/
              // var curr_osi = lane.GetOSIPoints();
              // var points = curr_osi_rm.GetPoints();
              // for (var q = 0; q < curr_osi_rm.GetPoints().size(); q++) {
              // var point = curr_osi_rm.GetPoint(q);
              // pathResult.push({
              //   x: point.x,
              //   y: point.y
              // });
              // }
              /******reference line****************/
            }
          }
        }
        return totalLines;
      })
      .catch((e) => {
        console.log(e);
      });
  });
}
