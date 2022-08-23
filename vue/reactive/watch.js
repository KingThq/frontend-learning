/**
 * @title watch 的实现
 */

// source 是响应式数据或 getter 函数，cb 是回调函数
function watch(source, cb, options = {}) {
  // 定义 getter
  let getter;
  // 如果 source 是函数，说明用户传递的是 getter，所以直接把 source 赋值给 getter
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
    console.log(getter())
  }

  // 定义旧值与新值
  let oldValue, newValue;

  // 提取 scheduler 调度函数为一个独立的 job 函数
  const job = () => {
    // 在 scheduler 中重新执行副作用函数得到的是新值
    newValue = effectFn();
    // 将旧值和新值作为回调函数的参数
    cb(newValue, oldValue);
    // 更新旧值
    oldValue = newValue;
  };

  // 使用 effect 注册副作用函数时，开启 lazy，并把返回值存储到 effectFn 中以便后续手动调用
  const effectFn = effect(
    () => getter(),
    {
      lazy: true,
      scheduler() {
        // 在调度函数中判断 flush 为 post，将其放到任务队列中执行
        if (options.flush === 'post') {
          const p = Promise.resolve();
          p.then(job());
        } else {
          job();
        }
      },
    },
  );

  if (options.immediate) {
    // 当 immediate 为 true 时立即执行 job，从而触发回调执行
    job();
  } else {
    // 手动调用副作用函数，拿到的就是旧值
    oldValue = effectFn();
  }
}

function traverse(value, seen = new Set()) {
  // 如果需要读取的数据是原始值，或已经读取过了，则什么都不做
  if (typeof value !== 'object' || value === null || seen.has(value)) return;
  // 将数据添加到 seen 中，代表遍历的读取过了，避免循环引用引起的死循环
  seen.add(value);
  // 暂时不考虑数组等其他数据结构
  // 假设 value 就是一个对象，使用 for in 读取对象每一个值，并递归的调用 traverse 进行处理
  for (const key in value) {
    traverse(value[key], seen);
  }

  return value;
}

const effectStack = [];
let activeEffect;

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
    if (effectFn !== activeEffect) {
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

watch(
  () => obj.foo,
  (newValue, oldValue) => {
    console.log('watch run:', newValue, oldValue);
  },
  {
    immediate: true, // 在 watch 创建时立即执行一次回调函数
    // post 表示异步延迟执行，等 DOM 更新结束后再执行
    // sync 直接执行 job 函数就是 sync 的实现机制，即同步执行
    flush: 'pre', // 还可以指定 'post' | 'sync'
  },
);
obj.foo++
obj.bar++