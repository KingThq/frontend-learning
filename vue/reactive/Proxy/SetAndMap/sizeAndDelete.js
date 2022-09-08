/**
 * @title 对 size 和 delete 的代理
 * 
 * size 是一个访问器属性，delete 是一个方法
 */

// 封装用于代理 Set/Map 类型数据的逻辑
function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (key === 'size') {
        // 如果读取的是 size 属性
        // 通过指定 receiver 为原始对象 target 从而修复问题
        return Reflect.get(target, key, target);
      }
      // 将方法与原始数据对象 target 绑定后返回
      // 这样 delete() 语句执行时，delete 函数的 this 总是指向原始对象而不是代理对象
      return target[key].bind(target);
    },
  });
}

const reactiveMap = new Map();

function reactive(obj) {
  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;

  const proxy = createReactive(obj);
  reactiveMap.set(obj, proxy);

  return proxy;
}

const s = new Set([1, 2, 3]);
const p = reactive(s);
console.log(p.size);
p.delete(1);
console.log(p.size);