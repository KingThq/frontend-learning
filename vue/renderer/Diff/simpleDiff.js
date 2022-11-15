/**
 * @title 简单 Diff 算法
 */

const Text = Symbol();
const Comment = Symbol();
const Fragment = Symbol();

function createRenderer(options) {
  const {
    createElement,
    setElementText,
    insert,
    createText,
    setText,
    createComment,
    patchProps,
  } = options;

  function mountElement(vnode, container, anchor) {
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
        patchProps(el, key, null, vnode.props[key]);
      }
    }

    insert(el, container, anchor);
  }

  function patchElement(n1, n2) {
    const el = n2.el = n1.el;
    const oldProps = n1.props;
    const newProps = n2.props;

    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key]);
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null);
      }
    }

    patchChildren(n1, n2, el);
  }

  function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      }
      setElementText(container, n2.children);
    } else if (Array.isArray(n2.children)) {
      // Diff
      const oldChildren = n1.children;
      const newChildren = n2.children;

      // 用来存储寻找过程中遇到的最大索引值
      let lastIndex = 0;
      for (let i = 0; i < newChildren.length; i++) {
        const newVNode = newChildren[i];
        let j = 0;
        // 在第一层循环中定义了变量 find，代表是否在旧的一组子节点中找到可复用的节点
        // 初始值为 false，代表没找到
        let find = false;
        for (j; j < oldChildren.length; j++) {
          const oldVNode = oldChildren[j];
          // 如果找到了具有相同 key 的两个子节点，说明可以复用
          // 但仍然需要调用 patch 函数更新
          if (newVNode.key === oldVNode.key) {
            // 一旦找到可复用的节点，则将变量 find 的值置为 true
            find = true;
            patch(oldVNode, newVNode, container);
            if (j < lastIndex) {
              // 如果当前找到的节点在旧 children 中的索引小于最大索引值 lastIndex
              // 说明该节点对应的真实 DOM 需要移动
              // 先获取 newVnode 的前一个 vnode，即 prevVNode
              const prevVNode = newChildren[i - 1];
              // 如果 prevVNode 不存在，则说明当前 newVnode 是第一个节点，不需要移动
              if (prevVNode) {
                // 由于我们要将 newVnode 对应的真实 DOM 移动到 prevVNode 所对应的真实 DOM 后面，
                // 所以我们需要先获取 prevVNode 所对应真实 DOM 的下一个兄弟节点，并将其作为锚点
                const anchor = prevVNode.el.nextSibling;
                // 调用 insert 方法将 newVnode 所对应的真实 DOM 插入到锚点元素前面
                // 也就是 prevVNode 对应的真实 DOM 后面
                insert(newVNode.el, container, anchor);
              }
            } else {
              // 如果当前找到的节点在旧 children 中的索引不小于最大索引值 lastIndex
              // 则更新 lastIndex 的值
              lastIndex = j;
            }
            break;
          }
        }
        // 如果代码运行到这里 find 仍为 false，
        // 说明当前 newVNode 没有在旧的一组子节点中找到可复用的节点
        // 也就是说，当前 newVNode 是新增节点，需要挂载
        if (!find) {
          // 为了将节点挂载到正确位置，需要先获取锚点元素
          // 首先获取当前 newVNode 的前一个 vnode 元素
          const prevVNode = newChildren[i - 1];
          let anchor = null;
          if (prevVNode) {
            // 如果有前一个 vnode 节点，则使用它的下一个兄弟元素作为锚点元素
            anchor = prevVNode.el.nextSibling;
          } else {
            // 如果没有前一个 vnode 节点，说明即将挂载的新节点是第一个子节点
            // 则使用容器元素的 firstChild 作为锚点
            anchor = container.firstChild;
          }
          // 挂载 newVNode
          patch(null, newVNode, container, anchor);
        }
      }

      // 移除不存在的元素
      // 上一步的更新操作完成后
      // 遍历旧的一组子节点
      for (let i = 0; i < oldChildren.length; i++) {
        const oldVNode = oldChildren[i];
        // 拿旧子节点 oldVNode 去新的一组子节点寻找具有相同 key 值的节点
        const has = newChildren.find(vnode => vnode.key === oldVNode.key);
        if (!has) {
          // 如果没有找到具有相同 key 值的节点，则说明需要删除该节点
          unmount(oldVNode);
        }
      }

      // const oldLen = oldChildren.length;
      // const newLen = newChildren.length;
      // // 两组子节点的公共长度，即两者中较短的那一组子节点的长度
      // const commenLength = Math.min(oldLen, newLen);
      // // 遍历 commenLength 次
      // for (let i = 0; i< commenLength; i++) {
      //   patch(oldChildren[i], newChildren[i], container);
      // }
      // // 如果 newLen > oldLen，说明有新子节点需要挂载
      // if (newLen > oldLen) {
      //   for (let i = commenLength; i < newLen; i++) {
      //     patch(null, newChildren[i], container);
      //   }
      // } else if (oldLen > newLen) {
      //   // 如果 oldLen > newLen，说明有旧子节点需要卸载
      //   for (let i = commenLength; i < oldLen; i++) {
      //     unmount(oldChildren[i]);
      //   }
      // }
    } else {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      } else if (typeof n1.children === 'string') {
        setElementText(container, '');
      }
    }
  }

  function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1);
      n1 = null;
    }
    const { type } = n2;
    if (typeof type === 'string') {
      if (!n1) {
        // 挂载时将锚点元素作为第三个参数传递给 mountElement 函数
        mountElement(n2, container, anchor);
      } else {
        patchElement(n1, n2);
      }
    } else if (typeof type === Text) {
      if (!n1) {
        const el = n2.el = createText(n2.children);
        insert(el, container);
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          setText(el, n2.children);
        }
      }
    } else if (typeof type === Comment) {
      if (!n1) {
        const el = n2.el = createComment(n2.children);
        insert(el, container);
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          setText(el, n2.children);
        }
      }
    } else if (typeof type === Fragment) {
      if (!n1) {
        n2.children.forEach(c => patch(null, c, container));
      } else {
        patchChildren(n1, n2, container);
      }
    }
  }

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else  {
      if (container._vnode) {
        unmount(container._vnode);
      }
    }
    container._vnode = vnode;
  }

  return { render };
}

function unmount(vnode) {
  if (vnode.type === Fragment) {
    vnode.children.forEach(child => unmount(child));
    return;
  }
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
  createText(text) {
    return document.createTextNode(text);
  },
  setText(el, text) {
    el.nodeValue = text;
  },
  createComment(comment) {
    return document.createComment(comment);
  },
  patchProps(el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
      const invokers = el._vei || (el._vei = {});
      let invoker = invokers[key];
      const name = key.slice(2).toLowerCase();
      if (nextValue) {
        if (!invoker) {
          invoker = el.vei[key] = (e) => {
            // 如果事件发生的时间早于事件处理函数绑定的时间，则不执行事件处理函数
            if (e.timeStamp < invoker.attached) return;
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach(fn => fn(e));
            } else {
              invoker.value(e);
            }
          }
          invoker.value = nextValue;
          invoker.attached = performance.now();
          el.addEventListener(name, invoker);
        } else {
          invoker.value = nextValue;
        }
      } else if (invoker) {
        el.removeEventListener(name, invoker);
      }
    } else if (key === 'class') {
      el.className = nextValue || '';
    } else if (shouldSetAsProps(el, key, nextValue)) {
      // 获取该 DOM Properties 的类型
      const type = typeof el[key];
      if (typeof type === 'boolean' && nextValue === '') {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      el.setAttribute(key, nextValue);
    }
  },
});

const oldVnode = {
  type: 'div',
  children: [
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '2', key: 2 },
    { type: 'p', children: 'hello', key: 3 },
  ],
};
const newVnode = {
  type: 'div',
  children: [
    { type: 'p', children: 'world', key: 3 },
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '4', key: 4 },
    // { type: 'p', children: '2', key: 2 },
  ],
};

renderer.render(oldVnode, document.getElementById('app'));

setTimeout(() => {
  renderer.render(newVnode, document.getElementById('app'));
}, 3000);