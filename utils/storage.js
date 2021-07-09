/**
 * @title 封装 storage 方法
 */
const storageUtil = {
  get(key) {
    let value = localStorage.getItem(key);
    try {
      value = JSON.parse(value);
      return value;
    } catch (e) {
      return value;
    }
  },
  set(key, value) {
    let val = value;
    if (typeof value !== 'string') val = JSON.stringify(value);
    localStorage.setItem(key, val);
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  },
}