/**
 * @title leetcode 283.移动零
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
const moveZeroes = function(nums) {
  // index 表示非0元素的个数
  let index = 0;
  // 先保存所有非0元素
  // 循环结束 index 表示非0数组的长度
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nums[index] = nums[i];
      index++;
    }
  }
  while (index < nums.length) {
    nums[index++] = 0;
  }

  return nums;
};