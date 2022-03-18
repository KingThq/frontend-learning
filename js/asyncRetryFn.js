/**
 * @title 异步重试函数
 * @param {promise} cb 需要包装的函数
 * @param {function} saveErrorfn 保存失败日志
 * @param {number} retry 重试次数，业务不需要传递
 * @returns 
 */

const asyncRetryFn = (cb, saveErrorfn, retry) => {
  console.log('进入 asyncRetryFn 了, retry:', retry);

  if (!retry) {
    retry = 0;
  }

  const waitSeconds = retry < 5 ? 1 : 5;

  return new Promise(resolve => {
    setTimeout(async () => {
      try {
        const result = await cb();
        console.log('result:', result);
        resolve(result);
        return;
      } catch (e) {
        saveErrorfn(e);
      }
      console.log('开始回调了')
      const result = await asyncRetryFn(cb, saveErrorfn, ++retry);
      resolve(result);
      return;
    }, waitSeconds * 1000);
  });
};

class Test {
  main() {
    this.fetchData();
  }

  getData = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const num = Math.ceil(Math.random() * 100);
        console.log('随机数生成的值：',num)
        if(num <= 10){
          console.log('符合条件，值为'+num)
          resolve(num);
        }
        else{
          reject('数字大于10了执行失败');
        }
      }, 1000);
    });
  }

  logFn = (e) => {
    console.log('我是记录log的：', e);
  }

  fetchData = async () => {
    try {
      const res = await asyncRetryFn(() => this.getData(), (e) => this.logFn(e));
      console.log('asyncRetryFn 返回值：', res);
    } catch (error) {
      console.log('业务 error')
    }
  }
}

const test = new Test();
test.main();