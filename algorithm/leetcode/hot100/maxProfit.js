/**
 * @title leetcode 121.买卖股票的最佳时机
 * @param {number[]} prices
 * @return {number}
 */

// 暴力求解，超时
// const maxProfit = function (prices) {
//   let profit = 0;

//   for (let i = 0; i < prices.length; i++) {
//     for (let j = i + 1; j < prices.length; j++) {
//       profit = Math.max(profit, prices[j] - prices[i]);
//     }
//   }

//   return profit;
// };

/**
 * 动态规划
 * 前i天的最大收益 = max{前i-1天的最大收益，第i天的价格-前i-1天中的最小价格}
 */
const maxProfit = function (prices) {
  if (prices.length <= 1) return 0;

  // 初始化买入的最低价格
  let min = prices[0];
  // profit 前i天的最大收益
  let profit = 0;

  for (let i = 1; i < prices.length; i++) {
    profit = Math.max(profit, prices[i] - min);
    min = Math.min(min, prices[i]);
  }

  return profit;
};