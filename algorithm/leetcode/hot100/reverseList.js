/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @title leetcode 206.反转链表
 * @param {ListNode} head
 * @return {ListNode}
 */
/**
 * 迭代法
 * 1 -> 2 -> 3 -> 4 -> null
 * null <- 1 <- 2 <- 3 <- 4
 */
const reverseList = function(head) {
  // 前指针节点
  let pre = null;
  // 当前指针节点
  let cur = head;

  // 每次循环，都将当前节点指向它前面的节点，然后当前节点和前节点后移
  while (cur) {
    // 临时节点，暂存当前节点的下一节点，用于后移
    const next = cur.next;
    // 将当前节点指向它前面的节点
    cur.next = pre;
    // 前指针后移
    pre = cur;
    // 当前指针后移
    cur = next;
  }

  return pre;
};

/**
 * 递归
 * 1,next -> 2,next
 *   ^
 *   |
 *  head
 *   ||
 *   V
 * 1,next <- 2,next
 *   ^
 *   |
 *  head
 * 
 */
const reverseList = function (head) {
  if (head === null || head.next === null) return head;
  const p = reverseList(head.next);
  // 反转
  head.next.next = head;
  head.next = null;
  return p;
}