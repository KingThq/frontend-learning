/**
 * @title bind 实现
 */

Function.prototype.myBind = function (context) {
  if (typeof this !== "function") {
    throw new Error("Type Error");
  }

  const args = [...arguments].slice(1);
  const fn = this;
  return function Fn() {
    console.log(this instanceof Fn);
    // this instanceof Fn ? this : context
    // 一个绑定函数也能使用 new 操作符创建对象(例如：const bindBar = bar.myBind(obj) const obj2 = new bindBar())
    // 若传入的是构造函数实例，this 要指向当前实例
    // 当前的这个 arguments 是指 Fn 的参数
    return fn.apply(
      this instanceof Fn ? this : context,
      args.concat(...arguments)
    );
  };
};

const value = 2;
const obj = {
  value: 1,
  bar: bar.myBind(),
};
function bar() {
  this.habit = "basketball";
  console.log(this.value);
}

obj.bar();
bar.myBind(obj)(); // 1

const bindBar = bar.myBind(obj);
const obj2 = new bindBar();
console.log("obj2:", obj2);
