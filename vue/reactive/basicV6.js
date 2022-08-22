/**
 * @title 调度执行（scheduler）与不展示过渡状态
 */

/**
 * scheduler 实现控制副作用函数的执行顺序
 */
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };
  // 将 options 挂载到 effectFn 上
  effectFn.options = options;
  effectFn.deps = [];
  effectFn();
}
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);

  const effectsToRun = new Set();
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.push(effectFn);
    }
  });
  effectsToRun.forEach(effectFn => {
    // 如果一个副作用函数存在调度器，则调用该调度器，并将副作用函数作为参数传递
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      // 否则直接执行副作用函数
      effectFn();
    }
  })
}

const data = { foo: 1 };
const obj = new Proxy(data, {});
effect(
  () => {
    console.log(obj.foo)
  },
  // options
  {
    // 调度器 scheduler 是一个函数
    scheduler(fn) {
      // 将副作用函数放在宏任务队列中执行
      setTimeout(fn);
    }
  }
);
obj.foo++
console.log('end')
// result: 1 end 2

/**
 * scheduler 实现控制副作用函数的执行次数（不展示过渡状态）
 * 类似于 vue 中连续多次修改响应式数据只会触发一次更新
 */
// 定义一个任务队列，Set 可以实现任务去重
const jobQueue = new Set();
// 创建 promise 实例，用它将一个任务添加到微任务队列
const p = Promise.resolve();

// 一个标志代表是否正在刷新队列
let isFlushing = false;
function flushJob() {
  // 如果队列正在刷新，则什么都不做
  if (isFlushing) return;
  // 设置为 true，代表正在刷新
  isFlushing = true;
  // 在微任务队列中刷新 jobQueue 队列
  p.then(() => {
    jobQueue.forEach(job => job());
  }).finally(() => {
    // 结束后重置 isFlushing
    isFlushing = false;
  });
}

effect(() => {
  console.log(obj.foo);
}, {
  scheduler(fn) {
    // 每次调度时，将副作用函数添加到 jobQueue 队列中
    jobQueue.add(fn);
    // 调用 flushJob 刷新队列
    flushJob();
  }
});
obj.foo++;
obj.foo++;
// result: 1 3