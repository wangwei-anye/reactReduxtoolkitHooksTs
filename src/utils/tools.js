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

export function formatSeconds(value) {
  let result = parseInt(value);
  let h =
    Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600);
  let m =
    Math.floor((result / 60) % 60) < 10
      ? '0' + Math.floor((result / 60) % 60)
      : Math.floor((result / 60) % 60);
  let s = Math.floor(result % 60) < 10 ? '0' + Math.floor(result % 60) : Math.floor(result % 60);

  let res = '';
  if (h !== '00') res += `${h}:`;
  res += `${m}:`;
  res += `${s}`;
  return res;
}

//base64 转 文件
export function dataURLtoFile(dataURL, fileName, fileType) {
  var arr = dataURL.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: fileType || 'image/jpg' });
}
