/**
 * @title 拦截读取操作（in 操作符：key in obj）
 * 
 * in 操作符的运算结果是通过调用一个叫做 HasProperty 的抽象方法得到的，
 * 它对应的拦截函数名叫 has
 */

 const obj = { foo: 1 };

 const p = new Proxy(obj, {
  has(target, key) {
    track(target, key);
    return Reflect.has(target, key);
  },
 });

 effect(() => {
  'foo' in p // 将会建立依赖关系
 })