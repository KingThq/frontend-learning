/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @title leetcode 160.相交链表
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 */
const getIntersectionNode = function(headA, headB) {
  if (!headA || !headB) return null;

  // 定义两个头指针，第一轮让两个到达末尾节点的指针指向另一个链表的头部，最后如果相遇则为交点(在第一轮移动中恰好抹除了长度差)
  // 两个指针等于移动了相同的距离, 有交点就返回, 无交点就是各走了两条指针的长度
  let p1 = headA;
  let p2 = headB;

  // 在这里第一轮体现在p1和p2第一次到达尾部会移向另一链表的表头, 而第二轮体现在如果p1或p1相交就返回交点, 不相交最后就是null===null
  while (p1 !== p2) {
    p1 = p1 === null ? headB : p1.next;
    p2 = p2 === null ? headA : p2.next;
  }

  return p1;
};


const getListLen = (head) => {
  let len = 0;
  while (head) {
    len++;
    head = head.next;
  }
  return len;
};
const getIntersectionNode = function (headA, headB) {
  let lenA = getListLen(headA);
  let lenB = getListLen(headB);
  let p1 = headA;
  let p2 = headB;

  // 让p1为最长链表的头，lenA为其长度
  if (lenA < lenB) {
    [lenA, lenB] = [lenB, lenA];
    [p1, p2] = [p2, p1];
  }

  // 求长度差
  let i = lenA - lenB;
  // 让p1和p2在同一起点上（末尾位置对齐）
  while (i-- > 0) {
    p1 = p1.next;
  }
  while (p1 && p1 !== p2) {
    p1 = p1.next;
    p2 = p2.next;
  }

  return p1;
};