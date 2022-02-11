import Chance from 'chance';
/**
 * 生成全局唯一标识符
 * @return {string} 16进制唯一标识符
 */
export const createGUID = () => {
  const chance = new Chance();
  return chance.guid();
};
