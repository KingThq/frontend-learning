/**
 * @title 实现 数组 reduce
 * 
 */

Array.prototype.reduce = function(cb, initalValue) {
  const arr = this;
  let total = initalValue || arr[0];

  for (let i = initalValue ? 0 : 1; i < arr.length; i++) {
    total = cb(total, arr[i], i, arr);
  }

  return total;
}

const arr = [1, 2, 3, 4];
const sum = arr.reduce((pre, next) => {
  return pre + next
});
console.log(sum)