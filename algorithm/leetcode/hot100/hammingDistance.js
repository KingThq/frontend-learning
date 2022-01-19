/**
 * @title 461.汉明距离
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
const hammingDistance = function(x, y) {
  // 异或运算得到的值即x,y对应二进制位不同的位置
  // 只要计算这个值的二进制中 1 的个数即为汉明距离
  let val = x ^ y;
  let sum = 0;
  
  while (val) {
    sum += (val & 1);
    val = val >> 1;
  }

  return sum;
};