/**
 * @title 基础响应式系统（封装 track trigger 函数）
 */

// 用一个全局变量存储被注册的副作用函数
let activeEffect;
// effect 用来注册副作用函数
function effect(fn) {
  // 当调用 effect 注册副作用函数时，将副作用函数 fn 赋值给 activeEffect
  activeEffect = fn;
  // 执行副作用函数
  fn();
}

const bucket = new WeakMap();

// 原始数据
const data = { text: 'vue2' };
const obj = new Proxy(data, {
   get(target, key) {
     // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
     track(target, key);
     return target[key];
   },
   set(target, key, newVal) {
     target[key] = newVal;
     // 把副作用函数从桶里取出来并执行
     trigger(target, key);
   }
 });
 
 // 在 get 拦截函数内调用 track 函数追踪变化
 function track(target, key) {
   // 没有 activeEffect 直接 return
   if (!activeEffect) return target[key];
   let depsMap = bucket.get(target);
   if (!depsMap) {
     bucket.set(target, (depsMap = new Map()));
   }
   let deps = depsMap.get(key);
   if (!deps) {
     depsMap.set(key, (deps = new Set()));
   }
   deps.add(activeEffect);
 }
 // 在 set 拦截函数内调用 trigger 函数触发变化
 function trigger(target, key) {
   const depsMap = bucket.get(target);
   if (!depsMap) return;
   const effects = depsMap.get(key);
   effects && effects.forEach(fn => fn());
 }
 
 // 测试
 effect(() => {
   console.log('running effect:', obj.text);
 });
 setTimeout(() => {
   // 1秒后修改响应式数据
   obj.text = 'vue3';
 }, 1000);