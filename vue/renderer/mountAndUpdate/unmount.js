/**
 * @title 卸载操作和区分 vnode 的类型
 */

function createRenderer(options) {
  const {
    createElement,
    setElementText,
    insert,
    patchProps,
  } = options;

  function mountElement(vnode, container) {
    // 让 vnode.el 引用真实 DOM 元素
    const el = vnode.el = createElement(vnode.type);
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        patch(null, child, el);
      });
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key];
        patchProps(el, key, null, value);
      }
    }

    insert(el, container);
  }

  function patch(n1, n2, container) {
    // 如果 n1 存在，则对比 n1 和 n2 的类型
    if(n1 && n1.type !== n2.type) {
      // 如果新旧 vnode 的类型不同，则直接将旧 vnode 卸载，说明是两个不同的标签
      unmount(n1);
      n1 = null;
    }
    // 到这里，证明 n1 和 n2 所描述的内容相同
    const { type } = n2;
    // 如果 n2.type 的值是字符串类型，则它描述的是普通标签元素
    if (typeof type === 'string') {
      if (!n1) {
        mountElement(n2, container);
      } else {
        patchElement(n1, n2);
      }
    } else if (typeof type === 'object') {
      // 如果 n2.type 的值的类型是对象，则它描述的是组件
    } else if (typeof type === 'xxx') {
      // 处理其他类型的 vnode
    }
  }

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        // 调用 umount 函数卸载 vnode
        unmount(container._vnode);

        // // 根据 vnode 获取要卸载的真实 DOM 元素
        // const el = container._vnode.el;
        // // 获取 el 的父元素
        // const parent = el.parentNode;
        // // 调用 removeChild 移除元素
        // if (parent) {
        //   parent.removeChild(el);
        // }
      }
    }
    container._vnode = vnode;
  }

  return { render };
}

function unmount(vnode) {
  const parent = vnode.el.parentNode;
  if (parent) {
    parent.removeChild(vnode.el);
  }
}

function shouldSetAsProps(el, key, value) {
  if (key === 'form' && el.tagName === 'INPUT') return false;
  return key in el;
}

const renderer = createRenderer({
  createElement(tag) {
    return document.createElement(tag);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
  patchProps(el, key, prevValue, nextValue) {
    if (key === 'class') {
      el.className = nextValue || '';
    } else if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key];
      if (type === 'boolean' && nextValue === '') {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      el.setAttribute(key, nextValue);
    }
  }
});

const vnode = {
  type: 'div',
  children: '我是 div',
};

renderer.render(vnode, document.getElementById('app'));
renderer.render(null, document.getElementById('app'));