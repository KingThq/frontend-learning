/**
 * @title 最大子数组和
 * @param {number[]} nums
 * @return {number}
 */

// 暴力求解，会超时
const maxSubArray = function(nums) {
  let result = -Infinity;
  let sum = 0;

  for (let i = 0; i < nums.length; i++) {
    sum = 0;

    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      result = Math.max(result, sum);
    }
  }

  return result;
};

// 贪心算法
// 每一步都取最优解
const maxSubArray = function(nums) {
  let result = -Infinity;
  let sum = 0;

  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    result = Math.max(result, sum);

    if (sum < 0) {
      sum = 0;
    }
  }

  return result;
};

// 动态规划
// 本质：
// 缓存了一堆数据的迭代
// 在迭代时能快速的使用之前算过的数据结果减少运算量，推导出新的结果
/**
 * []
 * [] <- a, 包含a的最大值 = a
 * [a] <- b, 包含b的最大值 = Max(包含a的最大值 + b, b本身)
 * [a, b] <- c, 包含c的最大值 = Max(包含b的最大值 + c, c本身)
 * ....
 * 
 * 动态规划方程
 * dp[i] = Max(dp[i - 1] + nums[i], nums[i])
 * i: 包含的第几个元素
 * dp[i]: 包含的第几个元素的最大值
 * 
 * 包含第一个元素的最大值
 * 包含第二个元素的最大值
 * 包含第i个元素的最大值
 * dp[i] 挑选一个最大值就是整个数组能拿出来的最大值
 */
const maxSubArray = function(nums) {
  const dp = [];
  dp[0] = nums[0];
  let result = dp[0];

  for (let i = 1; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 1] + nums[i], nums[i]);
    result = Math.max(result, dp[i]);
  };

  return result;
}