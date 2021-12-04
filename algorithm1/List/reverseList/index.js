/**
 * @title 普通反转链表
 */

 const utils = require('./utils');

 // 声明链表结构
 class ListNode {
   constructor(val) {
     this.val = val;
     this.next = null;
   }
 }
 
 class List {
   /**
    * 以数组的形式传入：[1,2,3,4,5]
    * 转换为列表形式放入root属性中
    * 链表反转后转为数组形式放入listArr属性中
    * @param {any[]} valArr 
    */
   constructor(valArr) {
     this.root = utils.createList(valArr, valArr.length, 0);
     // this.listArr = utils.listToArray(this.reverse());
     this.listArr = utils.listToArray(this.recursiveReverse(null, this.root));
   }
 
   /**
    * 反转链表
    * 法一：循环
    */
   reverse() {
     const head = this.root;
     if (!head) return null;
 
     let pre = null;
     let cur = head;
 
     while(cur) {
       // 保存下一个节点的值
       const next = cur.next;
       cur.next = pre;
       pre = cur;
       cur = next;
     }
 
     return pre;
   }
 
   /**
    * 反转链表
    * 法二：递归
    * @param {ListNode} list 
    */
   recursiveReverse(pre, cur) {
     if (cur) {
       // 保存next节点
       const next = cur.next;
       cur.next = pre;
 
       return this.recursiveReverse(cur, next);
     }
 
     return pre;
   }
 }
 
 // 初始化链表
 const listArray = [1, 2, 3, 4, 5, null];
 const list = new List(listArray);
 
 console.log(list.listArr)
 