/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @title leetcode 104.二叉树的最大深度
 * @param {TreeNode} root
 * @return {number}
 */
const maxDepth = function(root) {
  const traverse = (r) => {
    if (r === null) return 0;
    if (r.left === null && r.right === null) return 1;

    let leftDep = 1;
    let rightDep = 1;
    leftDep += traverse(r.left);
    rightDep += traverse(r.right);
    
    return Math.max(leftDep, rightDep)
  };

  return traverse(root);
};