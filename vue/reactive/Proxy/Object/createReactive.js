/**
 * @title 创建响应式工厂函数
 */

/**
 * @param {*} obj 被代理的原始对象
 * @param {*} isShallow 代表是否为浅响应，默认为 false，即深响应
 * @param {*} isReadonly 代表是否只读，默认为 false，即非只读
 */
function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 代理对象可以通过 raw 属性访问原始对象
      if (key === receiver.raw) {
        return target;
      }
      // 非只读的时候才建立响应联系
      if (!isReadonly) {
        track(target, key);
      }

      // 得到原始值结果
      const res = Reflect.get(target, key, receiver);

      // 如果是浅响应，则直接返回原始值
      if (isShallow) {
        return res;
      }

      // 深响应
      if (typeof res === 'object' && res !== null) {
        // 调用 reactive 将结果包装成响应式数据并返回
        // 如果数据为只读，则调用 readonly 对值进行包装
        return isReadonly ? readonly(res) : reactive(res);
      }

      return res;
    },
    set(target, key, newVal, receiver) {
      // 如果属性是只读的，则打印警告信息并返回
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }

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
    deleteProperty(target, key) {
      // 如果属性是只读的，则打印警告信息并返回
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