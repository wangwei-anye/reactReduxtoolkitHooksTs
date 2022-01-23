import Mock from 'mockjs';
Mock.setup({ timeout: '100' });

Mock.mock('/test', 'get', {
  data: [
    {
      imgUrl: 'http://img0.imgtn.bdimg.com/it/u=2399615258,48145576&fm=26&gp=0.jpg',
      height: 0,
      name: '111111111111',
      isLoad: false
    },
    {
      imgUrl: 'http://img0.imgtn.bdimg.com/it/u=1430171714,2110459552&fm=26&gp=0.jpg',
      height: 0,
      name: '222222222222',
      isLoad: false
    },
    {
      imgUrl: 'http://img2.imgtn.bdimg.com/it/u=1234395457,3605114231&fm=26&gp=0.jpg',
      height: 0,
      name: '3333333333',
      isLoad: false
    },
    {
      imgUrl: 'http://img4.imgtn.bdimg.com/it/u=313290354,165879658&fm=26&gp=0.jpg',
      height: 0,
      name: '44444444444',
      isLoad: false
    },
    {
      imgUrl: 'http://img3.imgtn.bdimg.com/it/u=2609858485,2492473494&fm=26&gp=0.jpg',
      height: 0,
      name: '55555555555',
      isLoad: false
    }
  ]
});
