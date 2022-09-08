/**
 * @title 创建响应联系
 */

const { ITERATE_KEY, effect, track, trigger } = require('./base');

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') return target;
      if (key === 'size') {
        // 调用 track 函数建立响应联系
        // 因为新增、删除操作都会影响 size 属性，所以响应联系需要建立在 ITERATE_KEY 和副作用函数之间
        track(target, ITERATE_KEY);
        return Reflect.get(target, key, target);
      }
      // 返回定义在 mutableInstrumentations 中的方法
      return mutableInstrumentations[key];
    }
  });
}

// 定义一个对象，将自定义的 add 方法定义到该对象下
const mutableInstrumentations = {
  add(key) {
    // this 仍然指向的是代理对象，通过 raw 属性获取原始数据对象
    const target = this.raw;
    // 先判断值是否存在
    const hadKey = target.has(key);
    // 通过原始数据对象执行 add 方法添加具体的值
    // 注意，这里不需要 .bind 了，因为是直接通过 target 调用并执行的
    const res = target.add(key);
    if (!hadKey) {
      // 不存在的情况下才需要触发响应
      // 调用 trigger 函数触发响应，并执行操作类型为 ADD
      trigger(target, key, 'ADD');
    }

    // 返回操作结果
    return res;
  },
  delete(key) {
    const target = this.raw;
    const hadKey = target.has(key);
    const res = target.delete(key);
    // 当需要删除的元素确实存在时，才触发响应
    if (hadKey) {
      trigger(target, key, 'DELETE');
    }
    return res;
  }
};

const reactiveMap = new Map();

function reactive(obj) {
   // 优先通过原始对象 obj 寻找之前创建的代理对象，如果找到了，直接返回已有的代理对象
  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;

  // 否则，创建新的代理对象
  const proxy = createReactive(obj);
  // 存储到 Map 中，从而避免重复创建
  reactiveMap.set(obj, proxy);

  return proxy;
}

const p = reactive(new Set([1, 2, 3]));

effect(() => {
  console.log(p.size);
});
p.add(4);
p.delete(2);