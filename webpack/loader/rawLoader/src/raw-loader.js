/**
 * raw-loader 将文件内容输出为 string
 */

const loaderUtils = require('loader-utils');
const fs = require('fs');
const path = require('path');

module.exports = function (source) {
  // 获取 loader 参数
  const options = loaderUtils.getOptions(this);
  console.log('options:', options);

  // 输出文件
  // const url = loaderUtils.interpolateName(this, '[name].[ext]', { source });
  // console.log('url:', url)
  // this.emitFile(path.join(__dirname, url), source);

  // 异步 loader
  const callback = this.async();
  fs.readFile(path.join(__dirname, './async.txt'), 'utf-8', (err, data) => {
    if (err) {
      callback(err, '');
    }
    callback(null, data);
  });

  // 同步 loader
  const json = JSON.stringify(source)
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

  // this.callback(new Error('error'), json, 1, 2);
  return `export default ${json}`;
};