/**
 * @title 数组的查找方法
 * includes indexOf lastIndexOf
 */

// 定义一个 Map 实例，存储原始对象到代理对象的映射
const reactiveMap = new Map();

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

// 重写数组方法
// 重写的原因：可以支持用户使用代理对象查找，也可以使用原始对象查找
const arrayInstrumentations = {};
['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function(...args) {
    // this 是代理对象，先在代理对象中查找，将结果存储到 res 中
    let res = originMethod.apply(this, args);

    if (res === false || res === -1) {
      // res 为 false 说明没找到，通过 this.raw 拿到原始数组，再去其中查找，并更新 res 值
      res = originMethod.apply(this.raw, args);
    }
    // 返回最终结果
    return res;
  }
});

// 修改 get 拦截函数，目的是重写数组的 includes 方法。
// arr.includes 可以理解为读取代理对象 arr 的 includes 属性，会触发 get 拦截函数
function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') {
        return target;
      }
      // 如果操作的目标对象是数组，并且 key 存在于 arrayInstrumentations 上，
      // 那么返回定义在 arrayInstrumentations 上的值
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }

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
  });
}