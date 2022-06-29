// tools工具函数单元测试
const expect = require('chai').expect;

const tools = require('../src/utils/tools');

describe('Utils Tools', function () {
  describe('createGUID()', function () {
    it('36 characters', function () {
      expect(tools.createGUID().length).to.be.equal(36);
    });
    it('must be random', function () {
      expect(tools.createGUID()).to.not.equal(tools.createGUID());
    });
  });
});
