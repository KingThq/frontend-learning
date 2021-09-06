
# Frontend-learning
<pre>
  Continuous Learning...
</pre>

## Commit standard
```shell
npm i && npm run cm
```

## Title generation rules
```js
const dirTitleHandle = (path) => {
    if (hasPackageJsonFile) {
        // get!
        const titleCtx = packageJsonFile.description;
    } else {
        for (file in path) {
            fileIsDir ? dirTitleHandle(filePath) : parseFileCtx(filePath);
        }
    }
}

const parseFileCtx = (filePath) => {
    const titleReg = /@title (.*)/;
    const ctxStr = fileCtx;

    const found = ctxStr.match(titleReg);
    // get!
    const titleCtx = found[1];
}

dirTitleHandle(rootPath);
```

<pre>Css
    Flex: flex学习
buildReadMe: ReadMe构建工具
js
    asyncRetryFn.js:  异步重试函数
    myPromise.js:  手写 promise
utils
    getDuplicateArr.js:  对象数组去重
    storage.js:  封装 storage 方法
    urlPushState.js:  在 URL 上添加参数
webpack
    builderWebpack: 构建基础包配置及冒烟测试和单元测试
    largeNumber: 大整数加法打包(打包基础库)
    loaderOrder: 多 loader 执行顺序（从右到左）串行执行
    simpleWebpack: 手写简易 webpack
    ssr: 实现SSR打包
    tapableTest: webpack tapable 的使用及 compiler 实现
</pre>
