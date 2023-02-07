/**
 * @title apply 实现
 */

Function.prototype.myApply = function (context) {
  if (typeof this !== "function") {
    throw new Error("Type Error");
  }

  context = context || window;
  // 使用 Symbol 来保证属性唯一
  // 也就是保证不会重写用户自己原来定义在 context 中的同名属性
  const fnSymbol = Symbol();
  context[fnSymbol] = this;

  console.log("arguments[1]:", arguments[1]);

  let result = null;
  if (arguments[1]) {
    result = context[fnSymbol](...arguments[1]);
  } else {
    result = context[fnSymbol]();
  }
  delete context[fnSymbol];
  return result;
};

const obj = {
  a: 1,
};
function func() {
  console.log("func arguments:", arguments);
  console.log(this.a);
}
func.myApply(obj, [9, 8]);
