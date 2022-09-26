/**
 * 定义基础的 effect track trigger 等方法
 */

const ITERATE_KEY = Symbol();
const MAP_KEY_ITERATE_KEY = Symbol();

const bucket = new WeakMap();
const effectStack = [];
let activeEffect;
let shouldTrack = true;

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

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

// 追踪依赖
function track(target, key) {
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

// 触发响应
function trigger(target, key, type, newVal) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  
  const effects = depsMap.get(key);
  const effectsToRun = new Set();
  addEffectsToRun(effects, effectsToRun);

  // 当操作类型为 ADD 或 DELETE 时，需要触发与 ITERATE_KEY 相关联的副作用函数重新执行
  // 如果操作类型是 SET，并且目标对象是 Map 类型的数据，也应该触发那些与 ITERATE_KEY 相关联的副作用函数重新执行
  if (
    type === 'ADD' ||
    type === 'DELETE' ||
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
    (type === 'ADD' || type === 'DELETE') &&
    Object.prototype.toString.call(target) === '[object Map]'
  ) {
    const mapIterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY);
    addEffectsToRun(mapIterateEffects, effectsToRun);
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
  return  new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') return target;

      if (!isReadonly) {
        track(target, key);
      }

      const res = Reflect.get(target, key, receiver);

      if (isShallow) return res;

      if (typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res);
      }

      return res;
    },
    set(target, key, newVal, receiver) {
      if (isShallow) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }

      const oldVal = target[key];
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';
      const res = Reflect.set(target, key, newVal, receiver);

      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type, newVal);
        }
      }

      return res;
    },
    deleteProperty(target, key) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }

      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.defineProperty(target, key);

      if (res && hadKey) {
        trigger(target, key, 'DELETE');
      }

      return res;
    },
    // 拦截读取操作（for...in 操作）
    ownKeys(target) {
      track(target, ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    // 拦截读取操作（in 操作符：key in obj）
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
  });
}

// 创建深响应对象
function reactive(obj) {
  return createReactive(obj);
}
// 创建浅响应对象
function shallowReactive(obj) {
  return createReactive(obj, true);
}
// 创建深只读对象
function readonly(obj) {
  return createReactive(obj, false, true);
}
// 创建浅只读对象
function shallowReadonly(obj) {
  return createReactive(obj, true, true);
}

module.exports = {
  effect,
  track,
  trigger,
  reactive,
};