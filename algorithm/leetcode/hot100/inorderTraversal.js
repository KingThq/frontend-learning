/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @title leetcode 94.二叉树的中序遍历
 * @param {TreeNode} root
 * @return {number[]}
 */
/** 
 * 树的遍历一般有递归、迭代两种方法
 */
// 二叉树递归公式
// const traverse = function(root) {
//   if (root === null) return;
    // 中序
//   traverse(root.left);
//   console.log(root.val)
//   traverse(root.right);
// };

// 递归
const inorderTraversal = function(root) {
  const res = [];
  const traverse = function(r) {
    if (r === null) return;
    traverse(r.left);
    res.push(r.val);
    traverse(r.right);
  };

  traverse(root);
  return res;
};

// 迭代
// 模拟递归
const inorderTraversal = function(root) {
  // 如何模拟递归？先有个栈来保存运行时的上下文
  const stack = [];
  // 初始化指针指向当前根节点
  let cur = root;

  const res = [];

  while(stack.length > 0 || cur) {
    if (cur) {
      // 先保存上下文
      stack.push(cur);
      cur = cur.left;
    } else {
      // 请出之前存进去的节点
      const node = stack.pop();
      res.push(node.val);
      cur = node.right;
    }
  }

  return res;
};