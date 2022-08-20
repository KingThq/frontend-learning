/**
 * @title 简易版 vue 渲染器（创建节点）
 * 将虚拟 DOM 转为真实 DOM
 */

const vnode = {
  tag: 'div',
  props: {
    onClick: () => alert('hellow'),
  },
  children: 'click me',
};

// mountElement
function renderer(vnode, container) {
  // 创建 DOM 元素
  const el = document.createElement(vnode.tag);
  // 添加 DOM 元素属性、事件
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      // 事件
      el.addEventListener(
        key.substring(2).toLocaleLowerCase(), // click
        vnode.props[key], // () => alert()
      );
    }
  }

  // 处理 children
  if (typeof vnode.children === 'string') {
    // children 是字符串，说明是文本子节点
    el.applendChild(document.createTextNode(vnode.children));
  } else if (Array.isArray(vnode.children)) {
    // 递归调用 renderer 函数渲染子节点，当前 el 为挂载点
    vnode.children.forEach((child) => renderer(child, el));
  }

  // 将元素添加到挂载点下
  container.applendChild(el);
}