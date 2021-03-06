/**
 * @title leetcode 338.比特位计数
 * @param {number} n
 * @return {number[]}
 */
const countBits = function(n) {
  const dp = [];
  dp[0] = 0;

  for (let i = 1; i <= n; i++) {
    // 右移一位
    // 1100中1的个数与110中1的个数相同，而1100=12 110=6，1101比110多一个1
    // 当n为偶数时，最低位为0所以去掉加上对1的个数无影响。所以f(1100)=f(110)，即十进制f(12)=f(6)
    // 当n为奇数时，最低位为1所以去掉最低位会少一个1。而少的就是最低位的1.最低位的1可以通过是否为奇数来判断，即n%2==1即为奇数
    // 将n%2优化成 与 运算，即n&1。0&1=0 1&1=1（偶数相与为0，奇数相与为1）
    dp[i] = dp[i >> 1] + (i & 1);
  }

  return dp;
};