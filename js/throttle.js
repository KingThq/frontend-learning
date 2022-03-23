/**
 * @title 节流
 * 
 * 持续触发事件，每隔一段时间，只执行一次事件
 * 
 * @param {Function} fn 
 * @param {number} delay 
 * @returns 
 */

function throttle(fn, delay) {
  let timeout;

  return function() {
    const context = this;
    const args = arguments;

    if (!timeout) {
      timeout = setTimeout(() => {
        fn.apply(context, args);
        timeout = null;
      }, delay);
    }
  }
}

const fn = throttle(() => {
  console.log('throttle');
}, 200);

console.time();
for (let i = 0; i < 99999; i++) {
  fn();
}
console.timeEnd();
