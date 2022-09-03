/**
 * @title 隐式修改数组长度
 * push pop shift unshift splice 这些方法会隐式的修改数组长度
 */

/**
 * 例子：运行会得到栈溢出
 * 分析：
 *    第一个副作用函数运行，向数组中添加一个元素，push 方法会间接读取数组的 length 属性，
 *    所以第一个副作用函数执行完毕会与 length 建立响应联系。
 *    接着，第二个副作用函数执行，同样会与 length 属性建立响应联系。push 方法不仅会间接读取
 *    length 属性，还会间接设置 length 属性的值。
 *    第二个函数内的 push 方法的调用设置了 length 属性值。响应系统会把 length 相关联的副作用函数
 *    全部取出并执行，其中就包括第一个副作用函数。问题出在这里，第二个副作用函数还未执行完毕，就要再
 *    次调用第一个副作用函数了。
 *    第一个副作用函数再次执行。同样会间接设置数组的 length 属性。于是响应系统会把 length 相关联
 *    的副作用函数全部取出并执行，其中就包括第二个副作用函数。
 *    如此寻汗往复，最终导致调用栈溢出。
 * 解决：
 *    问题原因是 push 方法调用会间接读取 length 属性。只要屏蔽对 length 属性的读取，从而避免在它
 *    与副作用函数之间建立响应联系，就可以了。push 方法在语义上是修改操作，不是读取操作，所以避免建立
 *    响应联系并不会产生其他副作用。需要重写数组 push 方法。
 */
const arr = reactive([]);
// 第一个副作用函数
effect(() => {
  arr.push(1);
});
// 第二个副作用函数
effect(() => {
  arr.push(2);
});

// 重写数组方法
// 一个标记变量，代表是否进行追踪。默认为 true，即允许追踪
let shouldTrack = true;
['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    // 在调用原始方法之前，禁止追踪
    shouldTrack = false;
    const res = originMethod.apply(this, args);
    // 在调用原始方法之后，恢复原来行为，即允许追踪
    shouldTrack = true;
    return res;
  }
});
// 还需要修改 track 函数
function track(target, key) {
  // 当禁止追踪时，直接返回
  if (!activeEffect || !shouldTrack) return;
  // ...
}