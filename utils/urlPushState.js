import { parse, stringify } from 'querystring';

/**
 * @title 在 URL 上添加参数
 * @param key 参数名
 * @param value 参数值
 */
const urlPushState = (key, value) => {
  const { href } = window.location;
  const str = `${key}=${value}`;

  if (href.indexOf('?') > -1) {
    const param = href.split('?')[1];
    const paramObj = parse(param);
    // console.log('url param:', href, param, paramObj);
    if (key in paramObj) {
      // 存在相同的参数名则替换值
      if (value) {
        paramObj[key] = value;
      } else {
        paramObj[key] = '';
      }
      window.history.pushState({}, '', `?${stringify(paramObj)}`);
    } else if (param) {
      window.history.pushState({}, '', `?${param}&${str}`);
    } else {
      window.history.pushState({}, '', `?${str}`);
    }
  } else {
    window.history.pushState({}, '', `?${str}`);
  }
};

/**
 * 在 URL 上批量添加参数
 * @param {{key, value}[]} arr 
 */
const urlPushStateArr = (arr) => {
  arr.forEach(item => {
    urlPushState(item.key, item.value);
  });
};