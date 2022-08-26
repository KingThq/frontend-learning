/**
 * @title 拦截删除操作 delete
 * 
 * delete 操作符的行为依赖 [[Delete]] 内部方法，
 * 该内部方法可以使用 deleteProperty 拦截。
 * 
 * 删除对象属性会对 for...in 循环产生影响，所以要触发那些与 ITERATE_KEY 相关联的副作用函数
 * 重新执行。
 */

const p = new Proxy(obj, {
  deleteProperty(target, key) {
    // 检查被操作的属性是否是对象自己的属性
    const hadKey = Object.prototype.hasOwnProperty.call(target, key);
    // 使用 Reflect.defineProperty 完成对属性的删除
    const res = Reflect.defineProperty(target, key);

    if (res && hadKey) {
      // 只有当被删除的属性是对象自己的属性且成功删除时，手动触发更新
      trigger(target, key, 'DELETE');
    }

    return res;
  },
});

function trigger(target, key, type) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);

  const effectsToRun = new Set();
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn);
    }
  });

  // 当操作类型为 ADD 或 DELETE 时，需要触发与 ITERATE_KEY 相关联的副作用函数重新执行
  if (type === 'DELETE' || type === 'ADD') {
    const iterateEffects = depsMap.get(ITERATE_KEY);
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