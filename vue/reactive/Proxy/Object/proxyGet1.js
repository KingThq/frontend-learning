/**
 * @title 拦截读取操作（访问属性：obj.foo）
 */

const obj = { foo: 1 };

const p = new Proxy(obj, {
  get(target, key, receiver) {
    // 建立联系
    track(target, key);
    // 返回属性值
    return Reflect.get(target, key, receiver);
  }
});