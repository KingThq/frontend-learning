/**
 * 获取最长递增子序列下标的方法
 * 参考：https://juejin.cn/post/7081621840187097119、https://juejin.cn/post/6988489193215229982
 */

function getSeruence(arr) {
  const length = arr.length;

  // 描述最长递增子序列的数组，元素是递增元素对应的下标
  const result = [0];
  // result 最后一个元素
  let resultLast;

  let start, end, middle;

  // 保存当前 result 的前一项的索引
  let p = arr.slice();

  for (let i = 0; i < length; i++) {
    const arrI = arr[i];
    // 在 Vue3 Diff 中，0 表示该新节点不在旧节点的中，是需要进行新增的节点
    if (arrI !== 0) {
      resultLast = result[result.length - 1];

      if (arrI > arr[resultLast]) {
        p[i] = resultLast;
        result.push(i);
        continue;
      }

      // 通过二分查找保证最长递增子序列长度正确
      // 定义二分查找区间
      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = ((start + end) / 2) | 0; // 或者 middle = Math.floor((start + end) / 2)
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }

      // while 循环结束，start 和 end 会指向同一个元素
      // 比较 => 替换，当前子序列从头找到第一个大于当前值 arrI，并替换
      if (arr[result[start]] > arrI) {
        if (start > 0) {
          p[i] = result[start - 1]; // 与 p[i] = resultLast 作用相同
        }
        // 有可能替换会导致结果不正确
        result[start] = i;
      }
    }
  }

  // 下面主要修正由于贪心算法可能造成的最长递增子序列在原系列中不是正确的顺序
  let i = result.length;
  let last = result[i - 1];
  // 倒叙回溯 用 p 覆盖 result 进而找到最终正确的索引
  while (i-- > 0) {
    result[i] = last;
    last = p[last];
  }

  return result;
}

// 测试
// const data = [3, 2, 8, 9, 5, 6, 7, 11, 15, 4];
// const res = getSeruence(data);
// console.log("res:", res);
// console.log("res length:", res.length);
