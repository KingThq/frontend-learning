
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
            MinStack.js:  leetcode 155.最小栈
            climbStairs.js:  leetcode 70.爬楼梯
            countBits.js:  leetcode 338.比特位计数
            diameterOfBinaryTree.js:  543.二叉树的直径
            findDisappearedNumbers.js:  448.找到所有数组中消失的数字
            getIntersectionNode.js:  leetcode 160.相交链表
            hammingDistance.js:  461.汉明距离
            inorderTraversal.js:  leetcode 94.二叉树的中序遍历
            invertTree.js:  leetcode 226.翻转二叉树
            isPalindrome.js:  leetcode 234.回文链表
            isSymmetric.js:  leetcode 101.对称二叉树
            isValid.js:  leetcode 20.有效的括号
            majorityElement.js:  leetcode 169.多数元素
            maxDepth.js:  leetcode 104.二叉树的最大深度
            maxProfit.js:  leetcode 121.买卖股票的最佳时机
            maxSubArray.js:  leetcode 53.最大子数组和
            mergeTrees.js:  617.合并二叉树
            mergeTwoLists.js:  leetcode 21.合并两个有序链表
            moveZeroes.js:  leetcode 283.移动零
            reverseList.js:  leetcode 206.反转链表
            singleNumber.js:  leetcode 136.只出现一次的数字
            towSum.js:  leetcode 1.两数之和
buildReadMe: ReadMe构建工具
js
    Promise.js:  手写 promise
    asyncRetryFn.js:  异步重试函数
    debounce.js:  防抖
    deepClone.js:  深复制
    reduce.js:  实现 数组 reduce
    scheduler.js:  带并发的异步调度器 Scheduler
    throttle.js:  节流
    utils
        getDuplicateArr.js:  对象数组去重
        getURLParameters.js:  获取URL的查询参数键值对
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
