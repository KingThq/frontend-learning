
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
js: js console
utils
    storage.js:  封装 storage 方法
    urlPushState.js:  在 URL 上添加参数
webpack
    largeNumber: 大整数加法打包(打包基础库)
    ssr: 实现SSR打包
</pre>
