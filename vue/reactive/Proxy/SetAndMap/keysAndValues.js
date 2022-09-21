/**
 * @title values 和 keys
 */

const { mutableInstrumentations, ITERATE_KEY, MAP_KEY_ITERATE_KEY, effect, track } = require('./base');

const newMutableInstrumentation = {
  ...mutableInstrumentations,
  values() {
    return iterationMethod.call(this, 'values');
  },
  keys() {
    return iterationMethod.call(this, 'keys');
  },
};

function iterationMethod(type) {
  const target = this.raw;

  let itr;
  if (type === 'values') {
    itr = target.values();
  } else if (type === 'keys') {
    itr = target.keys();
  }

  const wrap = (val) => typeof val === 'object' && val !== null ? reactive(val) : val;

  if (type === 'keys') {
    // 调用 track 函数追踪依赖，在副作用函数与 MAP_KEY_ITERATE_KEY 之间建立响应联系，以此来解决不必要的更新
    // 因为 keys() 方法只关心 Map 类型数据键的变化，不关心值的变化
    track(target, MAP_KEY_ITERATE_KEY);
  } else {
    track(target, ITERATE_KEY);
  }

  return {
    next() {
      const { value, done } = itr.next();
      return {
        value: wrap(value),
        done,
      };
    },
    [Symbol.iterator]() {
      return this;
    }
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
    }
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
  for(const key of p.keys()) {
    console.log('key:', key)
  }
  // for(const value of p.values()) {
  //   console.log('value:', value)
  // }
});

p.set('key2', 'value3'); // 不会触发响应
p.set('key3', 'value3'); // 能触发响应