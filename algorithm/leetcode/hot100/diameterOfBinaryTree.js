/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @title 543.二叉树的直径
 * @param {TreeNode} root
 * @return {number}
 */
const diameterOfBinaryTree = function(root) {
  if (root === null) return 0;
  
  let max = 0;

  const traverse = (root) => {
    if (root === null) return 0;

    const leftSize = root.left === null ? 0 : traverse(root.left) + 1;
    const rightSize = root.right === null ? 0 : traverse(root.right) + 1;
    
    max = Math.max(max, leftSize + rightSize);
    return Math.max(leftSize, rightSize);
  }
  traverse(root);

  return max;
};