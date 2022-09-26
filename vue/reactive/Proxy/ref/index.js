/**
 * @title ref
 */

const { reactive, effect } = require('./base');

function ref(val) {
  const wrapper = {
    value: val,
  };
  // 区分一个数据是否是 ref
  // 使用 Object.defineProperty 在 wrapper 对象上定义一个不可枚举的属性 __v_isRef，并且值为 true
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true,
  });

  return reactive(wrapper);
}

// const refVal = ref(1);
// effect(() => {
//   console.log(refVal.value);
// });
// refVal.value = 2;


const obj = reactive({ foo: 1, bar: 2 });

// newObj 对象下具有与 obj 对象同名的属性，并且每个属性值都是一个对象，
// 该对象具有一个访问器属性 value，当读取 value 值时，其实读取的是 obj 对象下对应的属性值
const newObj = { ...toRefs(obj) };

function toRef(obj, key) {
  // 返回 ref
  const wrapper = {
    get value() {
      return obj[key];
    },
    // 允许设置值
    set value(val) {
      obj[key] = val;
    },
  };
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true,
  });

  return wrapper;
}
function toRefs(obj) {
  const ret = {};
  for (const key in obj) {
    ret[key] = toRef(obj, key);
  }
  return ret;
}

// effect(() => {
//   console.log(newObj.foo.value);
// });
// obj.foo = 100;

// const refFoo = toRef(obj, 'foo');
// refFoo.value = 200;


/** 自动脱 ref */
function proxyRefs(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      // 自动脱 ref 实现，如果读取的值是 ref，则返回它的 value 属性值
      return value.__v_isRef ? value.value : value;
    },
    set(target, key, newVal, receiver) {
      // 通过 target 读取真实值
      const value = target[key];
      // 如果值是 ref，则设置其对应的 value 属性值
      if (value.__v_isRef) {
        value.value = newVal;
        return true;
      }
      return Reflect.set(target, key, newVal, receiver);
    },
  });
}

const newObj2 = proxyRefs({ ...toRefs(obj) });
console.log(newObj2.foo);
console.log(newObj2.bar);
newObj2.foo = 100;
console.log(newObj2.foo);