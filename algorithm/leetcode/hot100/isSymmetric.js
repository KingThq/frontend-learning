/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @title leetcode 101.对称二叉树
 * @param {TreeNode} root
 * @return {boolean}
 */
// 递归
const isSymmetric = function(root) {
  if (!root) return true;

  const compare = function (leftNode, rightNode) {
    if (leftNode === null && rightNode === null) return true;
    if (leftNode === null || rightNode === null) return false;
    // if (leftNode.val === rightNode.val) return true;

    return leftNode.val === rightNode.val && compare(leftNode.left, rightNode.right) && compare(leftNode.right, rightNode.left);
  };

  return compare(root.left, root.right);
};

// 迭代
const isSymmetric = function (root) {
  if (!root) return true;

  // 保存运行时上下文
  const stack = [root.left, root.right];

  while (stack.length > 0) {
    const rightNode = stack.pop();
    const leftNode = stack.pop();

    if (leftNode === null && rightNode === null) continue;
    if (leftNode === null || rightNode === null || leftNode.val !== rightNode.val) return false;
    
    stack.push(leftNode.left);
    stack.push(rightNode.right);
    stack.push(leftNode.right);
    stack.push(rightNode.left);
  }

  return true;
};