
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
    layout: css 布局
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
    apply.js:  apply 实现
    asyncRetryFn.js:  异步重试函数
    bind.js:  bind 实现
    call.js:  call 实现
    debounce.js:  防抖
    deepClone.js:  深复制
    reduce.js:  实现 数组 reduce
    scheduler.js:  带并发的异步调度器 Scheduler
    throttle.js:  节流
    utils
        formatMoney.js:  格式化金额，每三位加逗号
        getDuplicateArr.js:  对象数组去重
        getURLParameters.js:  获取URL的查询参数键值对
        hideSomeNums.js:  隐藏银行卡号中间位数
        storage.js:  封装 storage 方法
        urlPushState.js:  在 URL 上添加参数
react
    hooks
        useState.js:  极简 useState 实现
vue
    cases
        renderer.js:  简易版 vue 渲染器（创建节点）
    reactive
        Proxy
            Array
                hideAffectLength.js:  隐式修改数组长度
                index.js:  代理数组
                indexAndLength.js:  数组索引与 length
                indexOf.js:  数组的查找方法
                traverse.js:  遍历数组
            Object
                createReactive.js:  创建响应式工厂函数
                proxyDelete.js:  拦截删除操作 delete
                proxyGet1.js:  拦截读取操作（访问属性：obj.foo）
                proxyGet2.js:  拦截读取操作（in 操作符：key in obj）
                proxyGet3.js:  拦截读取操作（for...in 操作）
                reasonableTriggerRes.js:  合理触发响应
            SetAndMap
                avoidEffectOriginalData.js:  避免污染原始数据
                createReactive.js:  创建响应联系
                forEach.js:  处理 forEach
                iterator.js:  迭代器方法
                keysAndValues.js:  values 和 keys
                sizeAndDelete.js:  对 size 和 delete 的代理
            ref
                index.js:  ref
        basic.js:  基础响应式系统的实现
        basicV1.js:  基础响应式系统
        basicV2.js:  基础响应式系统（封装 track trigger 函数）
        basicV3.js:  分支切换与 cleanup（避免副作用函数遗留问题）
        basicV4.js:  effect 嵌套和 effect 栈
        basicV5.js:  避免无限递归循环
        basicV6.js:  调度执行（scheduler）与不展示过渡状态
        computed.js:  计算属性 computed 的实现
        expiredEffect.js:  过期的副作用（竞态问题）
        watch.js:  watch 的实现
    renderer
        mountAndUpdate
            childrenAndAttribute.js:  挂载子节点和元素的属性
            class.js:  class 的处理
            unmount.js:  卸载操作和区分 vnode 的类型
        simple.js:  自定义渲染器
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
