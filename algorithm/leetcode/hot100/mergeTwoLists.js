/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @title leetcode 21.合并两个有序链表
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
/**
 * 遇到链表遍历用 while
 */

const mergeTwoLists = function(list1, list2) {
   // 初始化带头节点的链表
   let preHead = p = new ListNode();

  while (list1 && list2) {
    if (list1.val < list2.val) {
      p.next = list1;
      list1 = list1.next;
    } else {
      p.next = list2;
      list2 = list2.next;
    }

    p = p.next;
  }

  p.next = list1 || list2;
  return preHead.next;
};



/**
 * 带头节点的链表遍历
 * preHead -> node1 -> node2 -> node3
 *    ^
 *    |
 *    p
 */
while (p.next) {
  doSomething(p.next);
  p = p.next;
}

/**
 * 不带头节点的链表遍历
 * node1 -> node2 -> node3
 *   ^
 *   |
 *   p
 */
 while (p) {
  doSomething(p);
  p = p.next;
}

/**
 * 带2个头节点的链表遍历
 * preHead -> preHead -> node1 -> node2 -> node3
 *    ^
 *    |
 *    p
 */
 while (p.next.next) {
  doSomething(p.next.next);
  p = p.next;
}