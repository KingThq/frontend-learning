/**
 * @title 避免无限递归循环
 * 
 * 例
 * const data = { foo: 1 };
 * const obj = new Proxy(data, { ... });
 * effect(() => {
 *   obj.foo++;
 *   // obj.foo = obj.foo + 1;
 * })
 * 如上代码，自增操作 obj.foo++ 会引起栈溢出
 * 
 * 原因分析：obj.foo++ 这个语句中，既会读取 obj.foo 的值，又会设置
 * obj.foo 的值。读取时触发 track 操作，将副作用函数加入“桶”中；设置时触
 * 发 trigger 操作，把“桶”中的副作用函数取出并执行。但是该副作用函数正在执
 * 行中，还没有执行完毕就开始下一次执行，就会无限递归的调用自己，从而导致栈溢出。
 * 
 * 如何解决：在 trigger 发生时增加守卫条件：
 * 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行。
 */
   
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);

  const effectsToRun = new Set();
  effects && effects.forEach(effectFn => {
    // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn);
    }
  });
  effectsToRun.forEach(effectFn => effectFn());
}