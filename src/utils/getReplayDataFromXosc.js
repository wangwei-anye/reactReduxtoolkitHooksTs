import { libjsesmini } from './libjsesmini';
import { ASSERT_SERVE } from '@/constants';
import { createGUID } from '@/utils/tools';

const MapList = [
  'crest-curve.xodr',
  'straight_500m.xodr',
  'multi_intersections.xodr',
  'e6mini.xodr',
  'curve_r100.xodr',
  'fabriksgatan.xodr',
  'curves.xodr',
  'jolengatan.xodr',
  'soderleden.xodr',
  'straight_500m_signs.xodr'
];

let Module_libjsesmini = null;
const getModule = async () => {
  return libjsesmini()().then(async (Module) => {
    // for (let i = 0; i < MapList.length; i++) {
    //   const mapData = await getDataHandle(`${ASSERT_SERVE}/download/xodr/${MapList[i]}`);
    //   Module['FS_createPath']('./', 'xodr', true, true);
    //   Module['FS_createDataFile']('./xodr', MapList[i], mapData, true, true);
    // }

    const data3 = await getDataHandle('./xosc/Catalogs/Vehicles/VehicleCatalog.xosc');
    Module['FS_createPath']('./', 'xosc', true, true);
    Module['FS_createPath']('./xosc', 'Catalogs', true, true);
    Module['FS_createPath']('./xosc/Catalogs', 'Vehicles', true, true);
    Module['FS_createDataFile'](
      './xosc/Catalogs/Vehicles/',
      'VehicleCatalog.xosc',
      data3,
      true,
      true
    );

    const data4 = await getDataHandle('./xosc/Catalogs/Controllers/ControllerCatalog.xosc');
    Module['FS_createPath']('./xosc/Catalogs', 'Controllers', true, true);
    Module['FS_createDataFile'](
      './xosc/Catalogs/Controllers/',
      'ControllerCatalog.xosc',
      data4,
      true,
      true
    );

    const data5 = await getDataHandle('./xosc/Catalogs/Pedestrians/PedestrianCatalog.xosc');
    Module['FS_createPath']('./xosc/Catalogs', 'Pedestrians', true, true);
    Module['FS_createDataFile'](
      './xosc/Catalogs/Pedestrians/',
      'PedestrianCatalog.xosc',
      data5,
      true,
      true
    );

    Module.addSearchPath('./xodr');
    Module.addSearchPath('./xosc/Catalogs/Vehicles');
    Module.addSearchPath('./xosc/Catalogs/Pedestrians');
    Module.addSearchPath('./xosc/Catalogs/Controllers');

    return Module;
  });
};

export const loadMapAndCreateFile = async (url) => {
  let M;
  if (Module_libjsesmini) {
    M = Module_libjsesmini;
  } else {
    Module_libjsesmini = await getModule();
    M = Module_libjsesmini;
  }
  const arr = url.split('/');
  let mapName = '';
  if (arr.length > 0) {
    mapName = arr[arr.length - 1];
  }
  const mapData = await getDataHandle(`${ASSERT_SERVE}/download/xodr/${url}`);
  M['FS_createPath']('./', 'xodr', true, true);
  M['FS_createDataFile']('./xodr', mapName, mapData, true, true);
};

//type = 1 url ； type = 2 file
export default async function (url, type = 1) {
  let M;
  if (Module_libjsesmini) {
    M = Module_libjsesmini;
  } else {
    Module_libjsesmini = await getModule();
    M = Module_libjsesmini;
  }
  let data;
  if (type === 1) {
    data = await getDataHandle(ASSERT_SERVE + url);
  } else {
    data = await getDataFromFileHandle(url);
  }
  const GUID = createGUID();
  M['FS_createDataFile']('.', `${GUID}.xosc`, data, true, true);
  const initScenarioEngine = () => {
    return new M.ScenarioEngine(`./${GUID}.xosc`, false);
  };
  return initScenarioEngine;
}

const getDataHandle = async (url) => {
  return fetch(url)
    .then((file_data) => {
      return file_data.text();
    })
    .then((file_text) => {
      return file_text;
    });
};

const getDataFromFileHandle = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = async (e) => {
      let data = e.target.result;
      resolve(data);
    };
  });
};
