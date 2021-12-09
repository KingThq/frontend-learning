/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
/**
 * 快慢指针
 * 如果有环，两个指针一定会相遇
 */
const hasCycle = function(head) {
  let slow = head;
  let fast = head;

  while (slow && fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    // 快慢指针相遇，说明有环
    if (slow === fast) return true;
  }

  return false;
};