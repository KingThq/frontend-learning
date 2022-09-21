/**
 * @title 迭代器方法
 * 
 * 可迭代协议指的是一个对象实现了 Symbol.iterator 方法，而迭代器协议指的是一个对象实现了 next 方法。
 * 但一个对象可以同时实现可迭代协议和迭代器协议。
 */

const { track, ITERATE_KEY, mutableInstrumentations, effect } = require("./base");

const newMutableInstrumentation = {
  ...mutableInstrumentations,
  get(key) {
    const target = this.raw;
    const had = target.has(key);

    track(target, key);
    if (had) {
      // 如果存在，则返回结果。如果得到的结果 res 仍然是可代理的数据，则要返回使用 reactive 包装后的响应式数据
      const res = target.get(key);
      // 注意在这里直接返回 res，没有使用 reactive 包装，具体引入后可能需要重写 get 方法
      return typeof res === 'object' ? reactive(res) : res;
    }
  },
  forEach(callback, thisArg) {
    // 具体引入后需要重写 forEach 方法（因为没有定义 reactive 函数）
    const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
    const target = this.raw;
    track(target, ITERATE_KEY);
    target.forEach((v, k) => {
      // 手动调用 callback，用 wrap 函数包裹 value 和 key 后再传给 callback，这样就实现了深响应
      callback.call(thisArg, wrap(v), wrap(k), this);
    });
  },

  [Symbol.iterator]: itetationMethod,
  entries: itetationMethod,
}

function itetationMethod() {
  const target = this.raw;
  // 获取原始迭代器方法
  const itr = target[Symbol.iterator]();

  // 期望 key 和 value 也是响应式数据
  const wrap = (val) => typeof val === 'object' && val !== null ? reactive(val) : val;

  // 调用 track 函数建立响应联系
  track(target, ITERATE_KEY);

  // 返回自定义的迭代器
  return {
    // 迭代器协议
    next() {
      // 调用原始迭代器的 next 方法获取 value 和 done
      const { value, done } = itr.next();
      return {
         // 如果 value 不是 undefined，则对其进行包裹
        value: value ? [wrap(value[0]), wrap(value[1])] : value,
        done,
      };
    },
    // 可迭代协议
    [Symbol.iterator]() {
      return this;
    },
  };
}

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') return target;
      if (key === 'size') {
        track(target, ITERATE_KEY);
        return Reflect.get(target, key, target);
      }
      return newMutableInstrumentation[key];
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

const p = reactive(new Map([
  ['key1', 'value1'],
  ['key2', 'value2'],
]));
effect(() => {
  for (const [key, value] of p) {
    console.log(key, value)
  }

  for (const [key, value] of p.entries()) {
    console.log('extries:', key, value)
  }
});
p.set('key3', 'value3') // 能触发响应