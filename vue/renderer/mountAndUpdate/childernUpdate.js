/**
 * @title 更新子节点
 * 
 * 新旧子节点有三种类型：
 *  1. 字符串类型：代表元素具有文本节点
 *  2. 数组类型：代表元素具有一组子节点
 *  3. null：代表元素没有子节点
 */

function createRenderer(options) {
  const {
    createElement,
    setElementText,
    insert,
    patchProps,
  } = options;

  function mountElement(vnode, container) {
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

    insert(el, container);
  }

  // 更新子节点
  function patchElement(n1, n2) {
    const el = n2.el = n1.el;
    const oldProps = n1.props;
    const newProps = n2.props;
    // 第一步：更新 props
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

    // 第二步：更新 children
    patchChildren(n1, n2, el);
  }

  function patchChildren(n1, n2, container) {
    // 判断新子节点的类型是否是文本节点
    if (typeof n2.children === 'string') {
      // 旧子节点的类型有三种可能：没有子节点、文本子节点以及一组子节点
      // 只有当旧子节点为一组子节点时，才需要逐个卸载，其他情况下什么都不需要做
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      }
      // 最后将新的文本节点内容设置给容器元素
      setElementText(container, n2.children);
    } else if (Array.isArray(n2.children)) {
      // 说明新子节点是一组子节点
      // 判断旧子节点是否也是一组子节点
      if (Array.isArray(n1.children)) {
        // 到这里说明新旧子节点都是一组子节点，这里涉及核心 Diff 算法
        // 在此先暴力破解
        // 将旧的一组子节点全部卸载
        n1.children.forEach(c => unmount(c));
        // 再将新的一组子节点全部挂载到容器中
        n2.children.forEach(c => patch(null, c, container));
      } else {
        // 此时：
        // 旧子节点要么是文本节点，要么不存在
        // 但无论哪种情况，只需要将容器清空，然后将新的一组子节点逐个挂载
        setElementText(container, '');
        n2.children.forEach(c => patch(null, c, container));
      }
    } else {
      // 代码运行到这里，说明新子节点不存在
      // 旧子节点是一组子节点，只需要逐个卸载即可
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      } else if (typeof n1.children === 'string') {
        // 旧子节点是文本节点，清空内容即可
        setElementText(container, '');
      }
      // 如果也没有旧子节点，则什么都不需要做
    }
  }

  function patch(n1, n2, container) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1);
      n1 = null;
    }
    const { type } = n2;
    if (typeof type === 'string') {
      if (!n1) {
        mountElement(n2, container);
      } else {
        patchElement(n1, n2);
      }
    } else if (typeof type === 'object') {}
  }

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        unmount(container._vnode);
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
    if (/^on/.test(key)) {
      const invokers = el._vei || (el._vei = {});
      let invoker = invokers[key];
      const name = key.slice(2).toLocaleLowerCase();
      if (nextValue) {
        if (!invoker) {
          invoker = el._vei[key] = (e) => {
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
      const type = typeof el[key];
      if (typeof type === 'boolean' && nextValue === '') {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      el.setAttribute(key, nextValue);
    }
  }
});


const { effect, ref } = VueReactivity;
const bol = ref(false);

effect(() => {
  // const vnode = {
  //   type: 'div',
  //   props: {
  //     onClick: () => {
  //       bol.value = true;
  //     }
  //   },
  //   children: !bol.value ? 'click me' : null,
  // }

  const vnode = {
    type: 'div',
    props: {
      onClick: () => {
        bol.value = true;
      }
    },
    children: !bol.value ? 'click me' : 'text',
  }

  // const vnode = {
  //   type: 'div',
  //   props: {
  //     onClick: () => {
  //       bol.value = true;
  //     }
  //   },
  //   children: !bol.value ? 'click me' : [
  //     {
  //       type: 'p',
  //       children: 'p 标签',
  //     },
  //     'Some Text',
  //   ],
  // }

  renderer.render(vnode, document.getElementById('app'));
});