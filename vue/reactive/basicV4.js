/**
 * @title effect 嵌套和 effect 栈
 * 
 * 嵌套带来的问题：副作用函数嵌套时，内层副作用函数的执行会覆盖
 * activeEffect 的值，且永远不会恢复原来的值。这时再有响应式数据进行依赖收
 * 集，即使是在外层副作用函数中进行读取的，它们收集到的副作用函数也都是内层副作
 * 用函数。
 * 
 * 如何解决：需要一个副作用函数栈 effectStack，副作用函数执行时，将它压入栈
 * 中，执行完成后，从栈中弹出，并让 activeEffect 始终指向栈顶副作用函数。
 */

let activeEffect;
// effect 栈
const effectStack = [];

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    // 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
    activeEffect = effectFn;
    // 在调用副作用函数之前将当前副作用函数压入栈中
    effectStack.push(effectFn);
    fn();
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈
    // 并把 activeEffect 还原为之前的值
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  }
  effectFn.deps = [];
  effectFn();
}