/**
 * @title apply 实现
 */

Function.prototype.myApply = function(context) {
  if (typeof this !== 'function') {
    throw new Error('Type Error');
  }

  context = context || window;
  context.fn = this;
  
  console.log('arguments[1]:', arguments[1])

  let result = null;
  if (arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }
  delete context.fn;
  return result;
};

const obj = {
  a: 1,
};
function func() {
  console.log('func arguments:', arguments);
  console.log(this.a);
}
func.myApply(obj, [9, 8]);
