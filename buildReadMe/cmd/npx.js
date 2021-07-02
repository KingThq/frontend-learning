const execSync = require('child_process').execSync;
const { tryExecSync } = require('./utils');

module.exports = {
  cz: () => tryExecSync(() => execSync('npx cz', { stdio: 'inherit' })),
}