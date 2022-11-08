/**
 * @title 事件的处理
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

  function patch(n1, n2, container) {
    if (n1 && n1.type !== n2.type) {
      umount(n1);
      n1 = null;
    }
    const { type } = n2;
    if (typeof type === 'string') {
      if (!n1) {
        mountElement(n2, container);
      } else {
        patchElement(n1, n2);
      }
    } else if (typeof type === 'object') {

    } else {}
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
    // 匹配以 on 开头的属性，视其为事件
    if (/^on/.test(key)) {
      // 定义 el._vei (vei --> vue event invoker) 为一个对象，存在事件名称到事件处理函数的映射
      const invokers = el._vei || (el._vei = {});
      // 获取为该元素伪造的事件处理函数 invoker
      let invoker = invokers[key];
      // 根据属性名称得到对应的事件名称 例如 onClick ---> click
      const name = key.slice(2).toLowerCase();
      if (nextValue) {
        if (!invoker) {
          // 如果没有 invoker，则将一个伪造的 invoker 缓存到 el._vei[key] 中，避免覆盖
          invoker = el._vei[key] = (e) => {
            // 当伪造的事件处理函数执行时，会执行真正的事件处理函数
            // 如果 invoker.value 是数组，则遍历它并逐个调用事件处理函数
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach(fn => fn(e));
            } else {
              invoker.value(e);
            }
          };
          // 将真正的事件处理函数赋值给 invoker.value
          invoker.value = nextValue;
          // 绑定 invoker 为事件处理函数
          el.addEventListener(name, invoker);
        } else {
          // 如果 invoker 存在，意味着更新，并且只需要更新 invoker.value 值即可
          invoker.value = nextValue;
        }
      } else if (invoker) {
        // 新的事件绑定函数不存在，且之前绑定 invoker 存在，则移除绑定
        el.removeEventListener(name, invoker);
      }
    } else if (key === 'class') {
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
  props: {
    class: 'foo',
  },
  children: [
    {
      type: 'p',
      props: {
        onClick: () => {
          alert('click');
        },
        onMouseEnter: () => {
          console.log('mouse enter');
        },
        onMouseLeave: [
          () => {
            console.log('mouse leave 1');
          },
          () => {
            console.log('mouse leave 2');
          },
        ],
      },
      children: '我是 p 标签',
    },
  ],
};
const vnode2 = {
  type: 'div',
  props: {
    class: 'foo',
  },
  children: [
    {
      type: 'p',
      props: {
        onClick: () => {
          alert('click2');
        },
      },
      children: '我是 p 标签2',
    },
  ],
};

renderer.render(vnode, document.getElementById('app'));
// renderer.render(vnode2, document.getElementById('app'));