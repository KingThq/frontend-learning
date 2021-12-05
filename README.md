
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

## Thanks
README generate thanks [daoerche](https://github.com/daoerche)

<pre>Css
    Flex: flex学习
algorithm
    List
        reverseList
            index.js:  普通反转链表
            intervalReverse.js:  区间反转链表
    leetcode
        hot100
            isValid.js:  有效的括号
            mergeTwoLists.js:  合并两个有序链表
            towSum.js:  两数之和
buildReadMe: ReadMe构建工具
js
    asyncRetryFn.js:  异步重试函数
    myPromise.js:  手写 promise
    utils
        getDuplicateArr.js:  对象数组去重
        storage.js:  封装 storage 方法
        urlPushState.js:  在 URL 上添加参数
react
    hooks
        useState.js:  极简 useState 实现
webpack
    builderWebpack: 构建基础包配置及冒烟测试和单元测试
    largeNumber: 大整数加法打包(打包基础库)
    loader
        loaderOrder: 多 loader 执行顺序（从右到左）串行执行
        rawLoader: 实现 raw-loader
        simpleSpriteLoader: 简易合成雪碧图 loader
    plugins
        zipPlugin: 一个压缩构建资源为 zip 包的插件
    simpleWebpack: 手写简易 webpack
    ssr: 实现SSR打包
    tapableTest: webpack tapable 的使用及 compiler 实现
</pre>
