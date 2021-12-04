/**
 * @title 区间反转链表
 */

 const utils = require('./utils');

 // 声明链表结构
 class ListNode {
   constructor(val) {
     this.val = val;
     this.next = null;
   }
 }
 
 /**
  * 区间反转：
  * 反转从位置 m 到 n 的链表
  * 1 ≤ m ≤ n ≤ 链表长度
  * 输入: 1->2->3->4->5->NULL, m = 2, n = 4
  * 输出: 1->4->3->2->5->NULL
  */
 class List {
   /**
    * 以数组的形式传入：[1,2,3,4,5]
    * 转换为列表形式放入root属性中
    * 链表反转后转为数组形式放入listArr属性中
    * @param {any[]} valArr 
    * @param {number} m 起始位置
    * @param {number} n 结束位置
    */
   constructor(valArr, m, n) {
     this.root = utils.createList(valArr, valArr.length, 0);
     this.listArr = utils.listToArray(this.reverseBetween(m, n));
     // this.listArr = utils.listToArray(this.recursiveReverse(null, this.root));
   }
 
   reverseBetween(m, n) {
     const head = this.root;
     if (!head) return null;
 
     let dummy = new ListNode(0);
     dummy.next = head;
 
     let tmpHead = dummy;
 
     // 找到第m-1个链表节点
     for (let i = 0; i < m - 1; i ++) {
       tmpHead = tmpHead.next;
     }
 
     let prev = null;
     let cur = tmpHead.next;
 
     for (let i = 0; i <= n - m; i ++) {
       let next = cur.next;
       cur.next = prev;
       prev = cur;
       cur = next;
     }
 
     // 将反转部分链表和原链表拼接
     tmpHead.next.next = cur;
     tmpHead.next = prev;
 
     return dummy.next;
   }
 
 }
 
 // 初始化链表
 const listArray = [1, 2, 3, 4, 5, null];
 const list = new List(listArray, 2, 4);
 
 console.log(list.listArr)