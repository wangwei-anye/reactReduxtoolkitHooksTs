export const STATE_DOING = 1;
export const STATE_COMPLETE = 2;
export const STATE_ERROR = 3;
export const STATE_UNKNOW = 4;
export const STATE_PASSS = 5;
export const STATE_OUT_TIME = 6;
export const STATE_ACCIDENT = 7;
export const STATE_QUEUE = 8;
export const STATE_MAP = {
  1: '测试中', //test
  2: '已完成', //pass
  3: '异常', //error
  4: '未知', //error
  5: '正常结束', //pass
  6: '超时', //error
  7: '发生交通事故', //error
  8: '排队中' //error
};
