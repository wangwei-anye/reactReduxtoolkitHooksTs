import { libjsesmini } from './libjsesmini';
import { ASSERT_SERVE } from '@/constants';

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
export default function (url) {
  return libjsesmini()().then(async (Module) => {
    const data = await getDataHandle(url);
    Module['FS_createDataFile']('.', 'xoscFile.xosc', data, true, true);

    for (let i = 0; i < MapList.length; i++) {
      const mapData = await getDataHandle(`${ASSERT_SERVE}/download/xodr/${MapList[i]}`);
      Module['FS_createPath']('./', 'xodr', true, true);
      Module['FS_createDataFile']('./xodr', MapList[i], mapData, true, true);
    }

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
    const initScenarioEngine = () => {
      return new Module.ScenarioEngine('./xoscFile.xosc', true);
    };
    return initScenarioEngine;
  });
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
