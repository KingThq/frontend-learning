/**
 * @title 隐藏银行卡号中间位数
 * @param {String | Number} value 需要处理的值
 * @param {Number} leftNum 前面保留的位数
 * @param {Number} rightNum 后面保留的位数
 * @param {Boolean | Undefined} isSpace 是否每隔四位加空格
 * @returns 字符串
 */
const hideSomeNums = (value, leftNum, rightNum, isSpace = false) => {
  if (!value) return value;

  if (typeof value === 'number') {
    value = value.toString();
  }

  const len = value.length;
  const hideLen = len - leftNum - rightNum;

  if (isSpace) {
    return `${value.slice(0, leftNum)} ${'*'.repeat(hideLen).replace(/(.{4})/g, '$1 ')}${hideLen % 4 ? ' ' : ''}${value.slice(-rightNum)}`;
  }
  return `${value.slice(0, leftNum)}${'*'.repeat(hideLen)}${value.slice(-rightNum)}`;
};

console.log(hideSomeNums('111122223333444', 4, 3, true));
console.log(hideSomeNums(11112222333444, 4, 3, true));
console.log(hideSomeNums('11112222333444', 4, 3));