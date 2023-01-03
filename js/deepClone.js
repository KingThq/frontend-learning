/**
 * @title 深复制
 * @param {Object} target 要拷贝的对象
 * @param {Map} map 用于存储循环引用对象的地址
 */
// 循环引用：obj.obj = obj;

const cloneDeep = (target = {}, map = new Map()) => {
  if (typeof target !== "object") {
    return target;
  }
  // 检查map中有无克隆过的对象 有，直接返回, 没有,将当前对象作为key，克隆对象作为value进行存储
  if (map.get(target)) {
    return map.get(target);
  }

  // 加 || 的原因是为了防止 Array 的 prototype 被重写
  const isArray =
    Array.isArray(target) ||
    Object.prototype.toString.call(target) === "[object Array]";
  // 保存结果
  let cloneTarget = isArray ? [] : {};

  // 防止循环引用
  map.set(target, cloneTarget);

  for (const key in target) {
    if (target.hasOwnProperty(key)) {
      // 保证 key 不是原型属性
      cloneTarget[key] = cloneDeep(target[key], map);
    }
  }

  return cloneTarget;
};
