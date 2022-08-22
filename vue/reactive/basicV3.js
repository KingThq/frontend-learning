/**
 * @title 分支切换与 cleanup（避免副作用函数遗留问题）
 */

let activeEffect;
function effect(fn) {
  const effectFn = () => {
    // 调用 cleanup 清除副作用函数
    cleanup(effectFn);
    // 当 effectFn 执行时，将其设置为当前激活的副作用函数
    activeEffect = effectFn;
    fn();
  }
  // activeEffect.deps 用来存储所有与该副作用相关联的依赖集合
  effectFn.deps = [];
  // 执行副作用函数
  effectFn();
}
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps 是依赖集合
    const deps = effectFn.deps[i];
    // 将 effectFn 从依赖集合中删除
    deps.delete(effectFn);
  }
  // 最后重置 effectFn.deps 数组
  effectFn.deps.length = 0;
}

const bucket = new WeakMap();

function track(target, key) {
  if (!activeEffect) return target[key];
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  // 将当前激活的副作用函数添加到依赖集合 deps 中
  deps.add(activeEffect);
  // deps 就是一个与当前副作用函数存在联系的依赖集合
  // 将其添加到 activeEffect.deps 数组中
  activeEffect.deps.push(deps);
}

// 以上部分可以解决副作用函数遗留问题
// 但是会导致无限循环，问题在 trigger 函数中
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  effects && effects.forEach(fn => fn()); // 问题在这
}
/**
 * 原因分析：当触发 trigger 时会执行副作用函数，调用 cleanup 从 effects 集合中
 * 将当前执行的副作用函数删除；而副作用函数的执行又会导致其重新被收集到集合中，此时
 * effects 的遍历仍在执行。
 * 
 * 语言规范说明：在调用 forEach 遍历 Set 集合时，如果一个值已经被访问过，但该值
 * 被删除并重新添加到集合，如果此时 forEach 遍历没有结束，那么该值会被重新访问。
 * 
 * 例：
 * const set = new Set([1])
 * set.forEach(item => {
 *  set.delete(1)
*   set.add(1)
*   console.log('遍历中)
 * })
 * 
 * 如何解决：构造一个新的 Set 集合并遍历
 */
function newTrigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  // 构造新 Set 集合，避免无限循环
  const effectsToRun = new Set(effects);
  effectsToRun.forEach(effectFn => effectFn());
}