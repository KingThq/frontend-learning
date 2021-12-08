/**
 * @title leetcode 136.只出现一次的数字
 * @param {number[]} nums
 * @return {number}
 */
const singleNumber = function(nums) {
  if (nums.length <= 1) return nums[0];

  for (let i = 0; i < nums.length; i++) {
    const idx = nums.indexOf(nums[i]);
    const lastIdx = nums.lastIndexOf(nums[i]);
    if (lastIdx === idx) return nums[i];
  }
};

// 异或
const singleNumber = function (nums) {
  return nums.reduce((a, b) => a ^ b, 0);
};