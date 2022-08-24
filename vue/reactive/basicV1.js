/**
 * @title 基础响应式系统
 */

// 用一个全局变量存储被注册的副作用函数
let activeEffect;
// effect 用来注册副作用函数
function effect(fn) {
  // 当调用 effect 注册副作用函数时，将副作用函数 fn 赋值给 activeEffect
  activeEffect = fn;
  // 执行副作用函数
  fn();
}

const bucket = new WeakMap();

// 原始数据
const data = { text: 'aaa' };
// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 没有 activeEffect 直接 return
    if (!activeEffect) return target[key];
    // 根据 target 从“桶”中取得 depsMap，它是 Map 类型：key --> effects
    let depsMap = bucket.get(target);
    // 如果不存在 depsMap，新建一个 Map 并与 target 关联
    if (!depsMap) {
      bucket.set(target, (depsMap = new Map()));
    }
    // 再根据 key 从 depsMap 中取得 deps 它是一个 Set 类型
    // 里面存储存储着所有与当前 key 相关联的副作用函数：effects
    let deps = depsMap.get(key);
    // 如果 deps 不存在，则创建一个新的 Set 并于 key 关联
    if (!deps) {
      depsMap.set(key, (deps = new Set()));
    }
    // 最后将当前激活的副作用函数添加到“桶”中
    deps.add(activeEffect);

    // 返回属性值
    return target[key];
  },
  // 拦截设置操作
  set(target, key, newVal) {
    // 设置属性值
    target[key] = newVal;
    // 根据 target 从“桶”中取得 depsMap，它是：key --> effects
    const depsMap = bucket.get(target);
    if (!depsMap) return;
    // 根据 key 取得所有副作用函数 effects
    const effects = depsMap.get(key);
    // 执行副作用函数
    effects && effects.forEach(fn => fn());
  },
});

// 测试
effect(() => {
  console.log('running effect:', obj.text);
});
setTimeout(() => {
  // 1秒后修改响应式数据
  obj.text = 'bbb';
}, 1000);