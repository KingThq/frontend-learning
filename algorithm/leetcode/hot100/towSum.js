/**
 * @title leetcode 1.两数之和
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */

// 暴力破解
 const twoSum = function(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
};

// 哈希表
const twoSum1 = function(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const val = nums[i];
    // needVal 是另一个需要找到的值
    const needVal = target - val;

    if (typeof map[needVal] === 'number') {
      return [i, map[needVal]];
    } else {
      map[val] = i;
    }
  }
};

twoSum([2,7,11,15], 9);