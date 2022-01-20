import { parse, stringify } from 'querystring';

/**
 * @title 在 URL 上添加参数
 * @param key 参数名
 * @param value 参数值
 */
const urlPushState = (key, value) => {
  const { search } = window.location;
  const newSearch = search.replace(/^\?/g, '');
  let queryObj = { [key]: value };

  if (newSearch) {
    const query = parse(newSearch); // {[key]: value}
    queryObj = Object.assign(query, queryObj);
  }
  Object.keys(queryObj).forEach(k => {
    if (queryObj[k] === undefined || queryObj[k] === null || queryObj[k] === '') {
      delete queryObj[k];
    }
  });
  window.history.pushState({}, '', `?${stringify(queryObj)}`);
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