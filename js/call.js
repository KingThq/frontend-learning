/**
 * @title call 实现
 */

Function.prototype.myCall = function(context) {
  if (typeof this !== 'function') {
    throw new Error('Type Error');
  }

  // 判断 context 是否传入，如果没有传就设置为 window
  context = context || window;
  // this 即为我们要调用的方法
  context.fn = this;

  console.log('arguments:', arguments)

  const args = [...arguments].slice(1);

  console.log('args:', args)

  let result = null;
  result = context.fn(...args);
  delete context.fn;
  return result;
};

const obj = {
  a: 1,
};
const a = 2;

function func(s1, s2) {
  console.log('s1:', s1);
  console.log('s2:', s2);
  console.log(this.a);
}

func.myCall(obj, 9, 8); // 1
func.myCall(null); // 2