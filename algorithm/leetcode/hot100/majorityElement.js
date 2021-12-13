/**
 * @title leetcode 169.多数元素
 * @param {number[]} nums
 * @return {number}
 */
const majorityElement = function(nums) {
  if (nums.length === 0) return null;

  // 记录数组中每个数出现的次数
  const map = {};
  // 多数元素
  let target = null;

  for (let i = 0; i < nums.length; i++) {
    map[nums[i]] = map[nums[i]] === undefined ? 1 : map[nums[i]] + 1;
  }
  Object.entries(map).forEach(arr => {
    if (arr[1] > nums.length / 2) {
      target = arr[0];
    }
  });

  return target;
};

// 利用哈希数组 时间复杂度：O(N) 空间复杂度：O(N)
const majorityElement = function(nums) {
  if (nums.length === 0) return null;

  // 记录数组中每个数出现的次数
  const map = {};
  // 多数元素
  let target = null;

  for (let i = 0; i < nums.length; i++) {
    map[nums[i]] = map[nums[i]] === undefined ? 1 : map[nums[i]] + 1;
    if (map[nums[i]] > nums.length / 2) {
      target = nums[i];
      break;
    }
  }

  return target;
};

/**
 * 摩尔投票法
 * 题目是假设数组是存在多数元素的,也就是说用摩尔投票法找出来的众数一定是超过n/2的
 * 
 * 时间复杂度O(N) 空间复杂度O(1)
 * 
 * 记录每个元素出现的次数
 * 相同，count+1
 * 不同，count-1
 * count减为0则统计下一个元素
 */
const majorityElement = function (nums) {
  let count = 1;
  let target = nums[0];

  for (let i = 1; i < nums.length; i++) {
    if (target === nums[i]) {
      count++;
    } else {
      count--;
      if (count === 0) {
        target = nums[i];
        count = 1;
      }
    }
  }

  return target;
};