/**
 * @title leetcode 70.爬楼梯
 * @param {number} n
 * @return {number}
 */
/**
 * 1层, 1种方法
 * 2层, 1+1, 2, 2种方法
 * 3层：
 *  1: (3 - 1) = 2层楼梯
 *  2: (3 - 2) = 1层楼梯
 * 
 * n: 楼梯数
 * f(n): 有多少种方法可以到楼顶
 * f(n) = f(n - 1) + f(n - 2)
 * 
 * 此方法超时
 */
const climbStairs = function(n) {
  if (n === 1) return 1;
  if (n === 2) return 2;

  return climbStairs(n - 1) + climbStairs(n - 2);
};

/**
 * 动态规划
 * dp[i]: 爬到第i层楼次，共有dp[i]种方法
 * dp[i] = dp[i - 1] + dp[i - 2]
 */
const climbStairs = function(n) {
  const dp = [];
  dp[1] = 1;
  dp[2] = 2;

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}