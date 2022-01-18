/**
 * @title 448.找到所有数组中消失的数字
 * @param {number[]} nums
 * @return {number[]}
 */
const findDisappearedNumbers = function(nums) {
  // 数组中的每一个元素都+数组的长度
  // 如果遇到已经增加的元素则先还原再增加
  const len = nums.length;
  for (const num of nums) {
    const idx = (num - 1) % len;
    nums[idx] += len;
  }

  const result = [];
  for (const [i, v] of nums.entries()) {
    if (v <= len) {
      // 当前值小于等于数组长度，代表这个值没有被增加过
      // 说明没有遇到过数 i + 1，这个数就是消失的数字
      result.push(i + 1);
    }
  }

  return result;
};

const findDisappearedNumbers = function(nums) {
  // 将所有正数作为数组下标，置对应数组值为负值
  // 则仍为正数的位置即为（未出现过）消失的数字
  for (let i = 0; i < nums.length; i++) {
    nums[Math.abs(nums[i]) - 1] = -Math.abs(nums[Math.abs(nums[i]) - 1]);
  }

  const res = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > 0) {
      res.push(i + 1);
    }
  }

  return res;
}