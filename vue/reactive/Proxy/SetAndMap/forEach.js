/**
 * @title 处理 forEach
 * 
 * 遍历操作只与键值对的数量有关，因此任何会修改 Map 对象键值对数量的操作都应该触发副作用函数重新执行，
 * 例如 delete 和 add 方法等。所以 forEach 函数被调用时，应该让副作用函数与 ITERATE_KEY 建立响应联系。
 * 
 * forEach 循环不仅关心集合的键，还关心集合的值，即使操作类型是 SET 也应该触发响应。
 */

const { track, ITERATE_KEY, effect, trigger } = require("./base");

const mutableInstrumentations = {
  // 接受第二个参数，该参数可以用来指定 callback 函数执行时的 this 值
  forEach(callback, thisArg) {
    // wrap 函数用来把可代理的值转换为响应式数据
    const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
    // 获取原始数据对象
    const target = this.raw;
    // 与 ITERATE_KEY 建立响应联系
    track(target, ITERATE_KEY);
    // 通过原始数据对象调用 forEach 方法，并把 callback 传递过去
    target.forEach((v, k) => {
      // 手动调用 callback，用 wrap 函数包裹 value 和 key 后再传给 callback，这样就实现了深响应
      // 通过 .call 调用 callback，并传递 thisArg
      callback.call(thisArg, wrap(v), wrap(k), this);
    });
  },
  set(key, value) {
    const target = this.raw;
    const had = target.has(key);
    const oldValue = target.get(key);

    let rawValue = value;
    if (Object.prototype.toString.call(value) === '[object, Map]') {
      rawValue = value.raw;
    }
    target.set(key, rawValue);
    
    if (!had) {
      trigger(target, key, 'ADD', value);
    } else if (oldValue !== value && (oldValue === oldValue || value === value)) {
      trigger(target, key, 'SET', value);
    }
  },
  get(key) {
    const target = this.raw;
    const had = target.has(key);

    track(target, key);

    if (had) {
      const res = target.get(key);
      return typeof res === 'object' ? reactive(res) : res;
    }
  },
  delete(key) {
    const target = this.raw;
    const had = target.has(key);
    const res = target.delete(key);

    if (had) {
      trigger(target, key, 'DELETE');
    }
    return res;
  },
};

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') return target;
      if (key === 'size') {
        track(target, ITERATE_KEY);
        return Reflect.get(target, key, target);
      }
      return mutableInstrumentations[key];
    },
  });
}

const reactiveMap = new Map();
function reactive(obj) {
  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;

  const proxy = createReactive(obj);
  reactiveMap.set(obj, proxy);
  return proxy;
}

// const p = reactive(new Map([
//   [{ key: 1 }, { value: 1 }]
// ]));
// effect(() => {
//   p.forEach((value, key) => {
//     console.log(value); // { value: 1 }
//     console.log(key) // { key: 1 }
//   });
// });
// // 能触发响应
// p.set([{ key: 2 }, { value: 2 }]);

// const key = { key: 1 };
// const value = new Set([1, 2, 3]);
// const p = reactive(new Map([
//   [key, value]
// ]));
// effect(() => {
//   p.forEach((value, key) => {
//     console.log(value.size);
//   });
// });
// p.get(key).delete(1);

const p = reactive(new Map([
  ['key', 1]
]));
effect(() => {
  p.forEach((value, key) => {
    // forEach 循环不仅关心集合的键，还关心集合的值
    console.log(value)
  });
});
p.set('key', 2) // 即使操作类型是 SET 也应该触发响应