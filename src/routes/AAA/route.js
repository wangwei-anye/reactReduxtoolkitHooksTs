const Index = import('./index');
const DDD = import('./DDD');
const EEE = import('./EEE');
export default [
  {
    breadcrumbName: 'AAA',
    path: '/aaa',
    component: Index,
    routes: [
      {
        breadcrumbName: 'EEE',
        path: '/eee',
        component: EEE,
      },
    ],
  },
  {
    breadcrumbName: 'DDD',
    path: '/ddd',
    component: DDD,
  },
];
