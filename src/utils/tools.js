import Chance from 'chance';
/**
 * 生成全局唯一标识符
 * @return {string} 16进制唯一标识符
 */
export const createGUID = () => {
  const chance = new Chance();
  return chance.guid();
};

export async function download(name, url) {
  return fetch(url)
    .then((res) => {
      return res.blob();
    })
    .then((res) => {
      const _url = URL.createObjectURL(res);
      const a = document.createElement('a');
      a.download = name;
      a.rel = 'noopener';
      a.href = _url;
      // 触发模拟点击
      a.dispatchEvent(new MouseEvent('click'));
      URL.revokeObjectURL(_url);
    });
}
