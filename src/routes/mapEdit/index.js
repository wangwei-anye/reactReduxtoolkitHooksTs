import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Card } from 'antd';
import DeckGL from '@deck.gl/react';
import { PathLayer } from '@deck.gl/layers';
import getDataFromXodr from './lib/getDataFromXodr';
import './index.less';

const MapEdit = () => {
  const [mapData, setMapData] = useState([]);
  const getData = async () => {
    const result = await getDataFromXodr();
    console.log(result);
    setMapData(result);
  };
  useEffect(() => {
    getData();
  }, []);
  const layer = new PathLayer({
    id: 'PathLayer',
    data: mapData,

    /* props from PathLayer class */

    // billboard: false,
    // capRounded: false,
    getColor: (d) => {
      const hex = d.color;
      // convert to RGB
      return hex.match(/[0-9a-f]{2}/g).map((x) => parseInt(x, 16));
    },
    getPath: (d) => d.path,
    getWidth: (d) => 5,
    // jointRounded: false,
    // miterLimit: 4,
    // widthMaxPixels: Number.MAX_SAFE_INTEGER,
    widthMinPixels: 2,
    widthScale: 20,
    // widthUnits: 'meters',

    /* props inherited from Layer class */

    // autoHighlight: false,
    // coordinateOrigin: [0, 0, 0],
    // coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    // highlightColor: [0, 0, 128, 128],
    // modelMatrix: null,
    // opacity: 1,
    parameters: {
      depthMask: false
    },
    pickable: true
    // visible: true,
    // wrapLongitude: false,
  });
  console.log(layer);

  return (
    <div className='map-edit-wrap'>
      <div className='map-box'>
        <DeckGL
          mapStyle={'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'}
          initialViewState={{
            longitude: 2.379402833028989e-15,
            latitude: 36.25000000000001,
            zoom: 2
          }}
          controller={true}
          getTooltip={({ object }) => object && object.name}
          layers={[layer]}
        ></DeckGL>
      </div>
    </div>
  );
};

export default MapEdit;
