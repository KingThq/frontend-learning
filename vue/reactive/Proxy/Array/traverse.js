/**
 * @title 遍历数组
 */

/**
 * 影响 for...in 循环对数组的遍历的操作：
 * 1. 添加新元素：arr[100] = 'bar
 * 2. 修改数组长度：arr.length = 0
 * 无论是为数组添加新元素还是修改数组长度，本质都是修改了数组的 length 属性。
 */
function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    ownKeys(target) {
      // 如果操作目标 target 是数组，则使用 length 作为 key 并建立响应联系
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    // 省略其他拦截函数
  });
}

/**
 * for...of 用来遍历可迭代对象
 * 一个对象能否被迭代，取决于该对象或者该对象的原型是否实现了 @@iterator（即：Symbol.iterator） 方法。
 * 数组迭代器执行会读取数组的 length 属性，迭代数组时只需要在副作用函数与数组 length 和索引之间建立
 * 响应联系，就能够实现响应式的 for...of 迭代
 * 
 * 无论使用 for...of 循环还是调用 values 等方法，它们都会读取数组的 Symbol.iterator 属性，该属性是
 * 一个 symbol 值，为了避免错误以及性能考虑，不应该在副作用函数与 Symbol.iterator 这类 symbol 值之间
 * 建立联系。
 */
function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'raw') {
        return target;
      }

      // 添加判断，如果 key 的类型是 symbol，则不进行追踪
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key);
      }

      const res = Reflect.get(target, key, receiver);

      if (isShallow) {
        return res;
      }

      if (typeof res !== 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res);
      }

      return res;
    }
    // 省略其他拦截函数
  });
}

const arr = [1, 2, 3];
arr[Symbol.iterator] = function() {
  const target = this;
  const len = target.length;
  let index = 0;

  return {
    next() {
      return {
        value: index < len ? target[index] : undefined,
        done: index++ >= len,
      }
    }
  }
}
for(const val of arr) {
  console.log(val)
}
console.log(Array.prototype.values === Array.prototype[Symbol.iterator]) // true