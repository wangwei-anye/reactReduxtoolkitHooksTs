import Icon_map1 from '../../../assets/images/maps/map1.png';
import Icon_map2 from '../../../assets/images/maps/map2.png';
import Icon_map3 from '../../../assets/images/maps/map3.png';
import Icon_map4 from '../../../assets/images/maps/map4.png';
import Icon_map5 from '../../../assets/images/maps/map5.png';
import Icon_map6 from '../../../assets/images/maps/map6.png';
import Icon_map7 from '../../../assets/images/maps/map7.png';
import Icon_map8 from '../../../assets/images/maps/map8.png';
import Icon_map9 from '../../../assets/images/maps/map9.png';
import Icon_map10 from '../../../assets/images/maps/map10.png';
import Icon_map11 from '../../../assets/images/maps/map11.png';
import Icon_main_car from '../../../assets/images/vehicle.png';
import Icon_main_car_rotate from '../../../assets/images/vehicle_rotate.png';
import Icon_flag from '../../../assets/images/flag.png';
import Icon_element_car from '../../../assets/images/obstacle_car.png';
import Icon_element_car_rotate from '../../../assets/images/obstacle_car_rotate.png';
import Icon_element_people from '../../../assets/images/obstacle_people.png';
import Icon_element_people2 from '../../../assets/images/obstacle_people2.png';
import Icon_element_people2_rotate from '../../../assets/images/obstacle_people2_rotate.png';
import Icon_element_animal from '../../../assets/images/obstacle_animal.png';
import Icon_element_animal2 from '../../../assets/images/obstacle_animal2.png';
import Icon_element_animal2_rotate from '../../../assets/images/obstacle_animal2_rotate.png';
import Icon_element_bicycle from '../../../assets/images/obstacle_bicycle.png';
import Icon_element_bicycle2 from '../../../assets/images/obstacle_bicycle2.png';
import Icon_element_bicycle2_rotate from '../../../assets/images/obstacle_bicycle2_rotate.png';
import Icon_element_trigger from '../../../assets/images/trigger.png';
//资源类型
export const RESOURCE_TYPE = {
  MAP: 'resource_map',
  MAIN_CAR: 'resource_main_car',
  ELEMENT: 'resource_element',
  ELEMENT_CAR: 'resource_element_car',
  ELEMENT_PEOPLE: 'resource_element_people',
  ELEMENT_ANIMAL: 'resource_element_animal',
  ELEMENT_BICYCLE: 'resource_element_bicycle',
  TRIGGERS: 'triggers',
  ROTATE_POINT: 'rotate_point' //旋转点
};
//加载到地图上的资源
export const Resource_load_tree = [
  {
    title: '地图',
    key: RESOURCE_TYPE.MAP
  },
  {
    title: '主车预设',
    key: RESOURCE_TYPE.MAIN_CAR
  }
];
//资源库
export const Resource_lib_tree = [
  {
    title: '地图',
    key: RESOURCE_TYPE.MAP
  },
  {
    title: '主车预设',
    key: RESOURCE_TYPE.MAIN_CAR
  },
  {
    title: '动态元素',
    key: RESOURCE_TYPE.ELEMENT,
    children: [
      { title: '小轿车', key: RESOURCE_TYPE.ELEMENT_CAR, isLeaf: true },
      { title: '行人', key: RESOURCE_TYPE.ELEMENT_PEOPLE, isLeaf: true },
      { title: '自行车', key: RESOURCE_TYPE.ELEMENT_BICYCLE, isLeaf: true },
      { title: '动物', key: RESOURCE_TYPE.ELEMENT_ANIMAL, isLeaf: true }
    ]
  },
  {
    title: '触发器',
    key: RESOURCE_TYPE.TRIGGERS
  }
];

//资源列表
export const Resource_list_map = [
  {
    title: 'multi_intersections',
    key: 'map1',
    url: 'multi_intersections.xodr',
    icon: Icon_map1
  },
  {
    title: 'straight_500m',
    key: 'map3',
    url: 'straight_500m.xodr',
    icon: Icon_map3
  },
  {
    title: 'e6mini',
    key: 'map4',
    url: 'e6mini.xodr',
    icon: Icon_map4
  },
  {
    title: 'crest-curve',
    key: 'map5',
    url: 'crest-curve.xodr',
    icon: Icon_map5
  },
  {
    title: 'curve_r100',
    key: 'map6',
    url: 'curve_r100.xodr',
    icon: Icon_map6
  },
  {
    title: 'fabriksgatan',
    key: 'map7',
    url: 'fabriksgatan.xodr',
    icon: Icon_map7
  },
  {
    title: 'curves',
    key: 'map8',
    url: 'curves.xodr',
    icon: Icon_map8
  },
  {
    title: 'jolengatan',
    key: 'map9',
    url: 'jolengatan.xodr',
    icon: Icon_map9
  },
  {
    title: 'soderleden',
    key: 'map10',
    url: 'soderleden.xodr',
    icon: Icon_map10
  },
  {
    title: 'straight_500m_signs',
    key: 'map11',
    url: 'straight_500m_signs.xodr',
    icon: Icon_map11
  }
];
export const Resource_list_main_car = [
  {
    title: '主车',
    id: 0,
    type: RESOURCE_TYPE.MAIN_CAR,
    length: 2.5,
    width: 1.8,
    height: 1.5,
    icon: Icon_main_car,
    icon2: Icon_flag,
    icon_select: Icon_main_car_rotate,
    routes: [],
    actImmediately: true,
    triggers: [],
    w: 377, //地图上显示的比例大小
    h: 180,
    selectW: 677, //地图上显示的比例大小
    selectH: 180
  }
];
export const Resource_list_element_car = [
  {
    title: '小轿车',
    id: 1,
    type: RESOURCE_TYPE.ELEMENT_CAR,
    length: 2.5, //图片占据地图大小
    width: 1.8,
    height: 1.5,
    icon: Icon_element_car,
    icon2: Icon_element_car,
    icon_select: Icon_element_car_rotate,
    routes: [],
    actImmediately: false,
    triggers: [],
    w: 377, //图片显示大小  图片真实宽高
    h: 180,
    selectW: 677, //地图上显示的比例大小  图片真实宽高
    selectH: 180
  }
];
export const Resource_list_element_people = [
  {
    title: '行人',
    id: 1,
    type: RESOURCE_TYPE.ELEMENT_PEOPLE,
    length: 0.5,
    width: 0.5,
    height: 1.7,
    icon: Icon_element_people,
    icon2: Icon_element_people2,
    icon_select: Icon_element_people2_rotate,
    routes: [],
    actImmediately: false,
    triggers: [],
    w: 50,
    h: 50,
    selectW: 350, //地图上显示的比例大小
    selectH: 70
  }
];

export const Resource_list_element_animal = [
  {
    title: '动物',
    id: 1,
    type: RESOURCE_TYPE.ELEMENT_ANIMAL,
    length: 0.5,
    width: 0.5,
    height: 1,
    icon: Icon_element_animal,
    icon2: Icon_element_animal2,
    icon_select: Icon_element_animal2_rotate,
    routes: [],
    actImmediately: false,
    triggers: [],
    w: 50,
    h: 50,
    selectW: 350, //地图上显示的比例大小
    selectH: 70
  }
];

export const Resource_list_element_bicycle = [
  {
    title: '自行车',
    id: 1,
    type: RESOURCE_TYPE.ELEMENT_BICYCLE,
    length: 1,
    width: 0.5,
    height: 2,
    icon: Icon_element_bicycle,
    icon2: Icon_element_bicycle2,
    icon_select: Icon_element_bicycle2_rotate,
    routes: [],
    actImmediately: false,
    triggers: [],
    w: 100,
    h: 50,
    selectW: 400, //地图上显示的比例大小
    selectH: 70
  }
];
export const Resource_list_triggers = [
  {
    title: '触发器',
    id: 1,
    type: RESOURCE_TYPE.TRIGGERS,
    icon: Icon_element_trigger,
    position: { x: -501, y: 400 },
    size: { width: 8, height: 8 },
    pos: [],
    triggeredId: []
  }
];
