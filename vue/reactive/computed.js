/**
 * @title 计算属性 computed 的实现
 * 计算属性实际上是一个懒执行的副作用函数
 * 手动添加 track、trigger 函数可以实现在副作用函数中嵌套计算属性
 */

let activeEffect;
const effectStack = [];

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    // 将 fn 的执行结果放到 res 中
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

function computed(getter) {
  // value 用来缓存上一次计算的值
  let value;
  // dirty 标志，用来标识是否需要重新计算值，为 true 需要重新计算
  let dirty = true;

  // 把 getter 作为副作用函数，创建一个 lazy 的 effect
  const effectFn = effect(getter, {
    lazy: true,
    // 添加调度器，在调度器中将 dirty 重置为 true
    // 会在 getter 函数中所依赖的响应式数据变化时执行
    scheduler() {
      if (!dirty) {
        dirty = true;
        // 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应
        trigger(obj, 'value');
      }
    },
  });

  const obj = {
    // 当读取 value 时才执行 effectFn
    get value() {
      // 只有 true 时才计算，并将得到的值缓存到 value 中
      if (dirty) {
        value = effectFn();
        // 将 dirty 置为 false，洗一次访问直接使用缓存到 value 中的值
        dirty = false;
      }
      // 当读取 value 时，手动调用 track 函数进行追踪
      track(obj, 'value');
      return value;
    }
  };

  return obj;
}

const bucket = new WeakMap();

const data = { foo: 1, bar: 2 };
const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newVal) {
    target[key] = newVal;
    trigger(target, key);
  }
});

function track(target, key) {
  if (!activeEffect) return target[key];
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

function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);

  const effectsToRun = new Set();
  effects && effects.forEach(effectFn => {
    if (activeEffect !== effectFn) {
      effectsToRun.add(effectFn);
    }
  });
  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

const sum = computed(() => obj.foo + obj.bar);
// console.log(sum.value) // 3
// 嵌套
effect(() => {
  console.log(sum.value)
})
obj.foo++
obj.foo++
