/**
 * @title 合理触发响应
 * 
 * 设置属性的新值与旧值相同时不触发
 * 处理 NAN 问题
 * 处理访问原型链上的属性导致副作用函数重新执行两次的问题
 */

 function reactive(obj) {
  return new Proxy(obj, {
    // 拦截读取操作
    get(target, key, receiver) {
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    // 拦截设置操作
    set(target, key, newVal, receiver) {
      const oldVal = target[key];
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';

      const res = Reflect.set(target, key, newVal, receiver);
      // 比较新值与旧值，只有当它们不全等，并且都不是 NAN 时才触发响应
      if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
        trigger(target, key, type);
      }

      return res;
    },
    // 拦截 in 操作符
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    // 拦截 for...in 操作
    ownKeys(target) {
      track(target, ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    // 拦截删除操作
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key);

      if (res && hadKey) {
        traigger(target, key, 'DELETE');
      }

      return res;
    },
  });
}

const obj = {};
const proto = { bar: 1 };
const child = reactive(obj);
const parent = reactive(proto);
// 使用 parent 作为 child 的原型
Object.setPrototypeOf(child, parent);

effect(() => {
  console.log(child.bar) // 1
});
child.bar = 2; // 会导致副作用函数执行两次

/**
 * 分析：访问 child.bar 时，值是从原型上继承来的。在副作用函数中读取 child.bar 的值时，
 * 会触发 child 代理对象的 get 拦截函数（相当于：Reflec.get(obj, 'bar', receiver)）
 * 即引擎内部是通过调用 obj 对象所部署的 [[Get]] 内部方法来取得最终结果的。当读取 child.bar
 * 时，由于 child 代理的对象 obj 自身没有定义 bar 属性，因此会获取对象 obj 的原型，也就是
 * parent 对象，最终得到的值实际上是 parent.bar 值。parent 本身也是响应式数据，因此在
 * 副作用函数中访问 parent.bar 的值时，会导致副作用函数被收集，从而也建立响应联系。即
 * child.bar 和 parent.bar 都与副作用函数建立了响应联系。
 * 当执行 child.bar = 2 时，会调用 child 的 set 拦截函数，使用 Reflect.set(target, key, newVal, receiver)
 * 来完成默认的设置行为，即引擎会调用 obj 对象部署的 [[Set]] 内部方法。如果设置的属性
 * 不存在于对象上，会取得其原型，调用原型的 [[Set]] 内部方法，也就是 parent 的 [[Set]] 内部方法。
 * 也就相当于执行了 parent 的 set 拦截函数。
 * 
 * 当设置 child.bar 的值时，child 的 set 拦截函数：
 * set(target, key, newVal, receiver) {
 *    // target 是原始对象 obj
 *    // receiver 是代理对象 child
 * }
 * receiver 其实就是 target 的代理对象
 * 执行 parent 的 set 拦截函数：
 * set(target, key, newVal, receiver) {
 *    // target 是原始对象 proto
 *    // receiver 仍然是代理对象 child
 * }
 * 此时 target 是原始对象 proto，receiver 仍然是代理对象 child，而不再是 target 的代理对象。
 * 由于最初设置的是 child.bar 的值，所以不论在什么情况下，receiver 都是 child，而 target 则是变化的。
 * 问题就变成了如何确定 receiver 是不是 target 的代理对象。
 */

function reactiveNew(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 代理对象可以通过 raw 属性访问原始对象
      if (key === raw) {
        return target;
      }

      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, newVal, receiver) {
      const oldVal = target[key];
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';
      const res = Reflect.set(target, key, newVal, receiver);

      // target === receiver.raw 说明 receiver 就是 target 的代理对象
      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type);
        }
      }

      return res;
    },
    // 省略其他拦截函数
  });
}