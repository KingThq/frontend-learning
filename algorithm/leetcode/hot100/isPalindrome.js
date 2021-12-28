/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @title leetcode 234.回文链表
 * @param {ListNode} head
 * @return {boolean}
 */
const isPalindrome = function(head) {
  if (!head) return false;

  let cur = head;
  const stack = [];

  while (cur) {
    stack.push(cur.val);
    cur = cur.next;
  }
  while (head) {
    if (head.val !== stack.pop()) return false;
    head = head.next;
  }

  return true;
};