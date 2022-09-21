/**
 * 定义基础的 effect track trigger 等方法
 */

const ITERATE_KEY = Symbol();
const MAP_KEY_ITERATE_KEY = Symbol();

const bucket = new WeakMap();
const effectStack = [];
let activeEffect;

// 一个标记变量，代表是否进行追踪。默认为 true，即允许追踪
let shouldTrack = true;

// 用来注册副作用函数
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}
// 避免副作用函数遗留问题
function cleanup(effectFn) {
  for(let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

function track(target, key) {
  // 当禁止追踪时，直接返回
  if (!activeEffect || !shouldTrack) return;

  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

function trigger(target, key, type, newVal) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);

  const effectsToRun = new Set();
  addEffectsToRun(effects, effectsToRun);

  // 当操作类型为 ADD 或 DELETE 时，需要触发与 ITERATE_KEY 相关联的副作用函数重新执行
  if (
    type === 'ADD' ||
    type === 'DELETE' ||
    // 如果操作类型是 SET，并且目标对象是 Map 类型的数据，
    // 也应该触发那些与 ITERATE_KEY 相关联的副作用函数重新执行
    (
      type === 'SET' &&
      Object.prototype.toString.call(target) === '[object Map]'
    )
  ) {
    const iterateEffects = depsMap.get(ITERATE_KEY);
    addEffectsToRun(iterateEffects, effectsToRun);
  }

  // Map keys() 方法处理不必要的更新
  if (
    // 操作类型为 ADD 或 DELETE
    (type === 'ADD' || type === 'DELETE') &&
    // 并且是 Map 类型的数据
    Object.prototype.toString.call(target) === '[object Map]'
  ) {
    // 取出那些与 MAP_KEY_ITERATE_KEY 相关联的副作用函数并执行
    const iterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY);
    addEffectsToRun(iterateEffects, effectsToRun);
  }

  // 当操作类型是 ADD 并且目标对象是数组时，应该取出并执行那些与 length 相关联的副作用函数
  if (type === 'ADD' && Array.isArray(target)) {
    const lengthEffects = depsMap.get('length');
    addEffectsToRun(lengthEffects, effectsToRun);
  }

  // 如果操作目标是数组，并且修改了数组的 length 属性
  if (Array.isArray(target) && key === 'length') {
    // 对于索引大于或等于新的 length 值的元素,需要把所有相关联的副作用函数取出并添加到 effectsToRun 中待执行
    // key newVal 当前指 length 值
    depsMap.forEach((effects, key) => {
      if (key >= newVal) {
        addEffectsToRun(effects, effectsToRun);
      }
    });
  }

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}
function addEffectsToRun(effects, effectsToRun) {
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn);
    }
  });
}

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

const reactiveMap = new Map();

function reactive(obj) {
  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;

  const proxy = createReactive(obj);
  reactiveMap.set(obj, proxy);
  return proxy;
}

// 定义一个对象，将自定义的集合方法定义到该对象下
const mutableInstrumentations = {
  add(key) {
    const target = this.raw;
    const had = target.has(key);
    const res = target.add(key);

    if (!had) {
      // 不存在的情况下才需要触发响应
      trigger(target, key, 'ADD');
    }
    return res;
  },
  delete(key) {
    const target = this.raw;
    const had = target.has(key);
    const res = target.delete(key);

    if (had) {
      // 当需要删除的元素确实存在时，才触发响应
      trigger(target, key, 'DELETE');
    }
    return res;
  },
  get(key) {
    const target = this.raw;
    const had = target.has(key);

    track(target, key);
    if (had) {
      // 如果存在，则返回结果。如果得到的结果 res 仍然是可代理的数据，则要返回使用 reactive 包装后的响应式数据
      const res = target.get(key);
      return typeof res === 'object' ? reactive(res) : res;
    }
  },
  set(key, value) {
    const target = this.raw;
    const had = target.has(key);
    const oldValue = target.get(key);

    // 获取原始数据，由于 value 本身可能已经是原始数据，所以此时 value.raw 不存在，则直接使用 value，避免污染原始数据
    let rawValue = value;
    if (Object.prototype.toString.call(target) === '[object Map]' && typeof value === 'object') {
      rawValue = value.raw;
    }
    target.set(key, rawValue);

    if (!had) {
      trigger(target, key, 'ADD');
    } else if (oldValue !== value || (oldValue === oldValue && value === value)) {
      trigger(target, key, 'SET');
    }
  },
  forEach(callback, thisArg) {
    const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
    const target = this.raw;
    track(target, ITERATE_KEY);
    target.forEach((v, k) => {
      // 手动调用 callback，用 wrap 函数包裹 value 和 key 后再传给 callback，这样就实现了深响应
      callback.call(thisArg, wrap(v), wrap(k), this);
    });
  },
  [Symbol.iterator]: iterationMethod,
  entries: iterationMethod,
};

function iterationMethod() {
  const target = this.raw;
  const itr = target[Symbol.iterator]();

  const wrap = (val) => typeof val === 'object' && val !== null ? reactive(val) : val;

  track(target, ITERATE_KEY);

  return {
    // 迭代器协议
    next() {
      const { value, done } = itr.next();
      return {
        value: value ? [wrap(value[0]), wrap(value[1])] : value,
        done,
      }
    },
    // 可迭代协议
    [Symbol.iterator]() {
      return this;
    }
  }
}

module.exports = {
  ITERATE_KEY,
  MAP_KEY_ITERATE_KEY,
  mutableInstrumentations,
  track,
  trigger,
  effect,
  reactive,
};