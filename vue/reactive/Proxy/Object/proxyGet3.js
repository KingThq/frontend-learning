/**
 * @title 拦截读取操作（for...in 操作）
 * 
 * 其关键点在于使用 Reflect.ownKeys(obj) 来获取只属于对象自身拥有的键
 * 使用 ownKeys 拦截函数来拦截 Reflect.ownKeys 操作
 */

const obj = { foo: 1 };
const ITERATE_KEY = Symbol();

/**
 * 在调用 track 函数时，使用 ITERATE_KEY 作为追踪的 key，是因为 ownKens 拦截函数
 * 与 get/set 拦截函数不同，在 get/set 中我们可以得到具体操作的 key，但是在 ownKeys
 * 中我们只能拿到目标对象 target。ownKeys 用来获取一个对象的所有属于自己的键值，这个
 * 操作不与任何具体的键相绑定，所以只能构造唯一的 key 作为标识，即 ITERATE_KEY。
 */
const p = new Proxy(obj, {
  ownKeys(target) {
    // 将副作用函数与 ITERATE_KEY 关联
    track(target, ITERATE_KEY);
    return Reflect.ownKeys(target);
  },
  set(target, key, newVal, receiver) {
    // 如果属性不存在，则说明是在添加新属性，否则是设置已有属性
    const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';

    // 设置属性值
    const res = Reflect.set(target, key, newVal, receiver);

    // 将 type 作为第三个参数传递给 trigger 函数
    trigger(target, key, type);

    return res;
  },
});

effect(() => {
  for (const key in p) {
    console.log(key) // foo
  }
});
p.bar = 2;
p.foo = 3;

/**
 * 当为对象添加新属性时，会对 for...in 循环产生影响，所以需要出发与 ITERATE_KEY 相关联
 * 的副作用函数重新执行。
 * 当修改对象的属性值时，对 for...in 循环不产生影响，所以不需要触发副作用函数重新执行，
 * 需要在 set 拦截函数内能够区分是添加新属性还是设置已有属性。
 */

function trigger(target, key, type) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);

  const effectsToRun = new Set();
  // 将与 key 相关联的副作用函数添加到 effectsToRun
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn);
    }
  });

  // 只有当操作类型为 ADD 时，才触发与 ITERATE_KEY 相关联的副作用函数重新执行
  if (type === 'ADD') {
    // 取得与 ITERATE_KEY 相关联的副作用函数
    const iterateEffects = depsMap.get(ITERATE_KEY);
      // 将与 ITERATE_KEY 相关联的副作用函数也添加到 effectsToRun
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });
  }

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}