// 声明链表结构
class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

module.exports = {
  /**
   * 将链表数组形式转换为链表形式
   * @param {any[]} arr 
   * @param {number} len 
   * @param {number} i 
   */
  createList(arr, len, i) {
    // null 和 undefined的情况都视为无节点, 即不再递归, 所以这里判断用 !=
    if (i < len && arr[i] != null) {
      const node = {};

      node.val = arr[i];
      node.next = this.createList(arr, len, i + 1);

      return node;
    }

    return null;
  },

  /**
   * 将链表转换为数组形式
   * @param {ListNode} list 
   */
  listToArray(list) {
    if (!list) return null;

    const initArr = [list.val];

    if (list.next) {
      const arr = this.listToArray(list.next)

      return initArr.concat(arr);
    }

    return initArr;
  }
}