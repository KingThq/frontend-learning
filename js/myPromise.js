/**
 * @title 手写 promise
 */

class MyPromise {
  constructor(executor) {
    // 初始化值
    this.initValue();
    // 初始化this指向
    this.initBind();
    // 执行传进来的函数
    try {
      executor(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  initValue() {
    this.PromiseState = 'pending'; // 状态
    this.PromiseResult = null; // 终值
    this.onFulfilledCallbacks = []; // 保存成功回调
    this.onRejectedCallbacks = [] // 保存失败回调
  }

  initBind() {
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
  }

  resolve(value) {
    if (this.PromiseState !== 'pending') return;

    this.PromiseState = 'fulfilled';
    // 终值为传进来的值
    this.PromiseResult = value;

    // 执行保存的成功回调
    while (this.onFulfilledCallbacks.length) {
      this.onFulfilledCallbacks.shift()(this.PromiseResult);
    }
  }

  reject(reason) {
    if (this.PromiseState !== 'pending') return;

    this.PromiseState = 'rejected';
    // 终值为传进来的值
    this.PromiseResult = reason;

    // 执行保存的失败回调
    while (this.onRejectedCallbacks.length) {
      this.onRejectedCallbacks.shift()(this.PromiseResult);
    }
  }

  then(onFulfilled, onRejected) {
    // 接收两个回调 onFulfilled, onRejected

    // 参数校验，确保一定是函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason; };

    var thenPromise = new MyPromise((resolve, reject) => {
      const resolvePromise = cb => {
        setTimeout(() => {
          // 将 then 变成微任务
          try {
            const x = cb(this.PromiseResult);
            if (x === thenPromise) {
              throw new Error('不能返回自身');
            }
            if (x instanceof MyPromise) {
              // 如果返回值是 Promise
              // 如果返回值是 promise 对象，返回值为成功，新 promise 就是成功
              // 如果返回值是 promise 对象，返回值为失败，新 promise 就是失败
              // 只有 then 知道 promise 是失败成功
              x.then(resolve, reject);
            } else {
              // 非 Promise 就直接成功
              resolve(x);
            }
          } catch (error) {
            reject(error);
          }
        });
      };

      if (this.PromiseState === 'fulfilled') {
        // 如果当前为成功状态，执行第一个回调
        resolvePromise(onFulfilled);
      } else if (this.PromiseState === 'rejected') {
        // 如果当前为失败状态，执行第二个回调
        resolvePromise(onRejected);
      } else if (this.PromiseState === 'pending') {
         // 如果状态为待定状态，暂时保存两个回调
         this.onFulfilledCallbacks.push(resolvePromise.bind(this, onFulfilled));
         this.onRejectedCallbacks.push(resolvePromise.bind(this, onRejected));
      }
    });

    return thenPromise;
  }

  // 接收一个Promise数组，数组中如有非Promise项，则此项当做成功
  // 如果所有Promise都成功，则返回成功结果数组
  // 如果有一个Promise失败，则返回这个失败结果
  static all(promises) {
    const result = [];
    let count = 0;

    return new MyPromise((resolve, reject) => {
      const addData = (index, value) => {
        result[index] = value;
        count++;
        if (count === promises.length) {
          resolve(result)
        }
      };

      promises.forEach((promise, index) => {
        if (promise instanceof MyPromise) {
          promise.then(res => {
            addData(index, res);
          }, err => reject(err));
        } else {
          addData(index, promise);
        }
      });
    });
  }

  // 接收一个Promise数组，数组中如有非Promise项，则此项当做成功
  // 哪个Promise最快得到结果，就返回那个结果，无论成功失败
  static race(promises) {
    return new Promise(function(resolve, reject) {
      promises.forEach(promise => {
        if (promise instanceof MyPromise) {
          promise.then(res => {
            resolve(res);
          }, err => {
            reject(err);
          });
        } else {
          resolve(promise);
        }
      });
    });
  }

  // 接收一个Promise数组，数组中如有非Promise项，则此项当做成功
  // 把每一个Promise的结果，集合成数组，返回
  static allSettled(promises) {
    return new MyPromise((resolve, reject) => {
      const result = [];
      let count = 0;

      const addData = (status, value, i) => {
        result[i] = {
          status,
          value,
        };
        count++;
        if (count === promises.length) {
          resolve(result);
        }
      };

      promises.forEach((promise, index) => {
        if (promise instanceof MyPromise) {
          promise.then(res => {
            addData('fulfilled', res, index);
          }, err => {
            addData('rejected', err, index);
          });
        } else {
          addData('fulfilled', promise, index);
        }
      });
    });
  }

  // 接收一个Promise数组，数组中如有非Promise项，则此项当做成功
  // 如果有一个Promise成功，则返回这个成功结果
  // 如果所有Promise都失败，则报错
  static any(promises) {
    return new MyPromise((resolve, reject) => {
      let count = 0;

      promises.forEach(promise => {
        promise.then(res => {
          resolve(res);
        }, err => {
          count++;
          if (count === promises.length) {
            reject(new AggregateError('All promises were rejected'));
          }
        });
      });
    });
  }
};


const test1 = new MyPromise((resolve, reject) => {
  resolve('成功')
});
console.log(test1) // MyPromise { PromiseState: 'fulfilled', PromiseResult: '成功' }

const test2 = new MyPromise((resolve, reject) => {
  reject('失败')
});
console.log(test2) // MyPromise { PromiseState: 'rejected', PromiseResult: '失败' }

const test3 = new MyPromise((resolve, reject) => {
  resolve('成功')
  reject('失败')
});
console.log(test3) // MyPromise { PromiseState: 'fulfilled', PromiseResult: '成功' }

const test4 = new MyPromise((resolve, reject) => {
  throw('失败')
});
console.log(test4) // MyPromise { PromiseState: 'rejected', PromiseResult: '失败' }

// 输出 ”成功“
new MyPromise((resolve, reject) => {
  resolve('成功')
}).then(res => console.log(res), err => console.log(err))

// 1秒后输出 成功
new MyPromise((resolve, reject) => {
  setTimeout(() => {
      resolve('成功');
  }, 1000)
}).then(res => console.log(res), err => console.log(err))

new MyPromise((resolve, reject) => {
  // resolve(100) // 输出 状态：成功 值： 200
  reject(100) // 输出 状态：失败 值：300
}).then(res => 2 * res, err => 3 * err)
  .then(res => console.log(res), err => console.log(err))

new MyPromise((resolve, reject) => {
  resolve(100) // 输出 状态：失败 值：200
  // reject(100) // 输出 状态：成功 值：300
}).then(res => new MyPromise((resolve, reject) => reject(2 * res)), err => new MyPromise((resolve, reject) => resolve(3 * err)))
  .then(res => console.log(res), err => console.log(err))