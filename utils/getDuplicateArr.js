/**
 * @title 对象数组去重
 * @param {any[]} arr 数组
 * @param {string} key 按 key 去重
 * @returns 对象数组
 */

const getDuplicateArr = (arr, key) => {
  const obj = {};
  return arr.reduce((item, next) => {
    obj[next[key]] ? '' : obj[next[key]] = true && item.push(next);
    return item;
  }, []);
}

const arr = [
  { id: 1, value: 'aaa' },
  { id: 2, value: 'bbb' },
  { id: 3, value: 'ccc' },
  { id: 1, value: 'aaa' },
];
console.log(getDuplicateArr(arr, 'id'));