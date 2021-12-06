/**
 * @title 获取URL的查询参数键值对
 * @param {string} url 
 */

const url = 'http://test.com?page=1&size=10';

const getURLParameters = url => (url
    .match(/([^?=&]+)(=([^&]*))/g) || [])
    .reduce((a, v) => {
    a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1);
    return a;
  }, {});

const result = getURLParameters(url);
console.log(result)
