/**
 * @title bind 实现
 */

Function.prototype.myBind = function(context) {
  if (typeof this !== 'function') {
    throw new Error('Type Error');
  }

  const args = [...arguments].slice(1);
  const fn = this;
  return function Fn() {
    // this instanceof Fn ? this : context
    // 若传入的是构造函数实例，this 要指向当前实例
    // 当前的这个 arguments 是指 Fn 的参数
    return fn.apply(this instanceof Fn ? this : context, args.concat(...arguments));
  };
}

const value = 2;
const obj = {
  value: 1,
  bar: bar.myBind(),
}
function bar() {
  console.log(this.value);
}

obj.bar();
bar.myBind(obj)() // 1