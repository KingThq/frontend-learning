/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @title leetcode 226.翻转二叉树
 * @param {TreeNode} root
 * @return {TreeNode}
 */
const invertTree = function(root) {
  const traverse = (root) => {
    if (root === null) {
      return root;
    }
    // 保存右节点
    const rightRoot = root.right;
    // 左右节点互换
    root.right = traverse(root.left);
    root.left = traverse(rightRoot);
    return root;
  };

  return traverse(root);
};