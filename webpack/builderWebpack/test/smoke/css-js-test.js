const glob = require('glob-all');

describe('Checking generated css js files', () => {
  it('should generate css js files', (done) => {
    const files = glob.sync([
      './dist/search_*.js',
      './dist/search_*.css',
    ]);
  
    if (files.length) {
      done();
    } else {
      throw new Error('no css js files generated');
    }
  });
});