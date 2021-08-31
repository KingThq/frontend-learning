const assert = require('assert');

describe('webpack.base.js test case', () => {
  const baseConfig = require('../../lib/webpack.base');

  it('entry', () => {
    // 断言
    assert.equal(baseConfig.entry.search, '/Users/hongqing/Desktop/My-projects/frontend-learning/webpack/builderWebpack/test/smoke/template/src/search/index.js');
  });
});