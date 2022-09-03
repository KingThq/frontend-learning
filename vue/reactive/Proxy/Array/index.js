/**
 * @title 代理数组
 */

const bucket = new WeakMap();
const effectStack = [];
let activeEffect;

const ITERATE_KEY = Symbol();

const arrayInstrumentations = {};
// 一个标记变量，代表是否进行追踪。默认为 true，即允许追踪
let shouldTrack = true;

// 重写数组方法
['includes', 'indexOf', 'lastIndexof'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    // this 是代理对象
    let res = originMethod.apply(this, args);
    if (res === false || res === -1) {
      // res 为 false 说明没找到，通过 this.raw 拿到原始数组，再去其中查找，并更新 res 值
      res = originMethod.apply(this.raw, args);
    }
    return res;
  }
});
['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    // 在调用原始方法之前，禁止追踪
    shouldTrack = false;
    const res = originMethod.apply(this, args);
    // 在调用原始方法之后，恢复原来行为，即允许追踪
    shouldTrack = true;
    return res;
  }
});

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
  if (type === 'ADD' || type === 'DELETE') {
    const iterateEffects = depsMap.get(ITERATE_KEY);
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
      if (key === 'raw') {
        return target;
      }

      // 如果操作的目标对象是数组，并且 key 存在于 arrayInstrumentations 上，
      // 那么返回定义在 arrayInstrumentations 上的值(includes indexOf lastIndexOf)
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }

      // 如果 key 的类型是 symbol，则不进行追踪(for...of)
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key);
      }

      const res = Reflect.get(target, key, receiver);

      if (isShallow) {
        return res;
      }

      if (typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res);
      }

      return res;
    },
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }

      const oldVal = target[key];
      // 如果属性不存在，则说明是在添加新属性，否则是设置已有属性
      const type = Array.isArray(target)
        // 如果代理目标是数组，则检测被设置的索引值是否小于数组长度
        // 如果是，则视为 SET 操作，否则是 ADD 操作
        ? Number(key) < target.length ? 'SET' : 'ADD'
        : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';
      
      const res = Reflect.set(target, key, newVal, receiver);

      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type, newVal);
        }
      }

      return res;
    },
    // for...in
    ownKeys(target) {
      // 如果操作目标 target 是数组，则使用 length 作为 key 并建立响应联系
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
  });
}

// 定义一个 Map 实例，存储原始对象到代理对象的映射
const reactiveMap = new Map();

// 创建深响应对象
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

// 创建深只读对象
function readonly(obj) {
  return createReactive(obj, false, true);
}

// 以下是测试：
const arr = reactive([]);
// 第一个副作用函数
effect(() => {
  arr.push(1);
});
// 第二个副作用函数
effect(() => {
  arr.push(2);
});
console.log(arr); // [1, 2]

const obj = {};
const arr1 = reactive([obj]);
console.log(arr1.includes(obj)); // true
console.log(arr1.includes(arr1[0])); // true

const arr2 = reactive([1, 2, 3, 4]);
effect(() => {
  for (const val of arr2) {
    console.log(val);
  }
  // for (const val of arr2.values()) {
  //   console.log(val);
  // }
});
arr2[1] = 'bar'; // 能触发响应
arr2.length = 0; // 能触发响应
console.log(arr2);