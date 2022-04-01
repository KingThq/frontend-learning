/**
 * @title 防抖
 * 
 * 在事件触发 n 秒后才执行，如果你在一个事件触发的 n 秒内又触发了这个事件，那我就以新的事件的时间为准，n 秒后才执行
 * 
 * @param {Function} func 
 * @param {number} wait 
 * @param {boolean} immediate 是否立即执行
 * @returns 
 */

function debounce(func, wait, immediate) {
  let timeout;

  return function () {
    let context = this;
    let args = arguments;

    console.log('this:', this);
    console.log('args:', args);

    console.log('timeout1:', timeout);

    if (timeout) clearTimeout(timeout);

    console.log('timeout2:', timeout);

    if (immediate) {
      let callNow = !timeout;
      
      console.log('callNow:', callNow);

      timeout = setTimeout(function () {
        timeout = null;
      }, wait);
      if (callNow) func.apply(context, args);
    } else {
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    }
  };
}

const fn = debounce(() => {
  console.log('aaa');
}, 2000, true);

console.time();
for(let i = 0; i < 4; i++) {
  fn(i);
}
console.timeEnd();