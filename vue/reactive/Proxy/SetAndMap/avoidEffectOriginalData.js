/**
 * @title 避免污染原始数据
 * 
 * 把响应式数据设置到原始数据上的行为称为数据污染
 */

const { effect, track, trigger, ITERATE_KEY } = require("./base");

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') return target;
      if (key === 'size') {
        track(target, ITERATE_KEY);
        return Reflect.get(target, key, target);
      }
      return mutableInstrumentations[key];
    }
  });
}

const mutableInstrumentations = {
  get(key) {
    // 获取原始对象
    const target = this.raw;
    // 判断读取的 key 是否存在
    const hadKey = target.has(key);
    // 追踪依赖，建立响应联系
    track(target, key);
    // 如果存在，则返回结果。如果得到的结果 res 仍然是可代理的数据，则要返回使用 reactive 包装后的响应式数据
    if (hadKey) {
      const res = target.get(key);
      return typeof res === 'object' ? reactive(res) : res;
    }
  },
  set(key, value) {
    const target = this.raw;
    const had = target.has(key);
    // 获取旧值
    const oldValue = target.get(key);

    // 获取原始数据，由于 value 本身可能已经是原始数据，所以此时 value.raw 不存在，则直接使用 value
    const rawValue = value.raw || value;
    // 设置新值
    target.set(key, rawValue);
    // 把 value 原封不动的设置到原始数据上就有可能造成数据污染
    // target.set(key, value);

    // 如果不存在则说明是 ADD 类型的操作
    if (!had) {
      trigger(target, key, 'ADD', value);
    } else if (oldValue !== value || (oldValue === oldValue && value === value)) {
      // 如果不存在，并且值变了，则是 SET 类型的操作
      trigger(target, key, 'SET', value);
    }
  },
};

const reactiveMap = new Map();

function reactive(obj) {
  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;

  const proxy = createReactive(obj);
  reactiveMap.set(obj, proxy);
  return proxy;
}

// 原始 Map 对象 m
const m = new Map();
const p1 = reactive(m);
const p2 = reactive(new Map());
// 为 p1 设置一个键值对，值是代理对象 p2
p1.set('p2', p2);

effect(() => {
  // 通过原始数据 m 访问 p2
  console.log(m.get('p2').size); // 只会打印一次 0
});
// 通过原始数据 m 为 p2 设置一个新的键值对
m.get('p2').set('foo', 1);