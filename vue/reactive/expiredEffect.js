/**
 * @title 过期的副作用（竞态问题）
 */

function watch(source, cb, options = {}) {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = traverse(source);
  }

  let oldValue, newValue;

  // 用来存储用户注册的过期回调
  let cleanup;
  // 定义 onValidate 函数
  function onValidate(fn) {
    // 将过期回调存储到 cleanup 中
    cleanup = fn;
  }

  const job = () => {
    newValue = effectFn();
    // 在调用回调函数 cb 之前，先调用过期回调
    if (cleanup) {
      cleanup();
    }
    // 将 onValidate 作为回调函数的第三个参数，以便用户使用
    cb(newValue, oldValue, onValidate);
    oldValue = newValue;
  }

  const effectFn = effect(
    () => getter(),
    {
      lazy: true,
      scheduler() {
        if (options.flush === 'post') {
          const p = Promise.resolve();
          p.then(job);
        } else {
          job();
        }
      },
    },
  );

  if (options.immediate) {
    job();
  } else {
    oldValue = job();
  }
}

// 测试
let finalData;

watch(obj, async (newValue, oldValue, onValidate) => {
  // 定义一个标志，代表当前副作用函数是否过期，默认为 false，代表没有过期
  let expired = false;
  // 调用 onValidate 注册一个过期回调
  onValidate(() => {
    // 当过期时，将 expired 设置为true
    expired = true;
  });

  // 发送网络请求，假设1000ms后返回结果
  const res = await fetch('/path/data');

  if (!expired) {
    finalData = res;
  }
});

// 第一次修改
obj.foo++
setTimeout(() => {
  // 200ms后做第二次修改
  obj.foo++
}, 200);

// 分析：
// 第一次修改立即执行，会导致 watch 的回调函数执行，在回调函数内调用了
// onValidate，所以会注册一个过期回调，接着发送请求 A；
// 假设请求 A 需要1000ms返回结果，在200ms的时候修改了 obj.foo，导致 watch
// 回调函数执行。每次执行回调函数之前会先检查过期回调是否存在，如果存在，优先
// 执行过期回调。在第一次执行时已经注册了过期回调，所以在 watch 回调函数
// 第二次执行之前会先执行过期回调，这会使得第一次执行的副作用函数内闭包的
// 变量 expired 的值变为 true，即副作用函数过期了。于是请求 A 返回结果时
// 其结果会被抛弃，从而避免了过期的副作用函数带来的影响。