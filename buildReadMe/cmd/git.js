const execSync = require('child_process').execSync;
const { tryExecSync } = require('./utils');

module.exports = {
  gitAddAllFile: () => tryExecSync(() => execSync('git add -A')),
  // git status --porcelain
  // 输出git add 或 git commit 的文件名
  gitStatusList: () => tryExecSync(() => execSync('git status --porcelain')),
}