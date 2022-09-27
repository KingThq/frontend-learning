/**
 * @title 挂载子节点和元素的属性
 */

function createRenderer(options) {
  const {
    createElement,
    insert,
    setElementText,
    patchProps,
  } = options;

  function mountElement(vnode, container) {
    const el = createElement(vnode.type, container);

    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      // 如果 children 是数组，则遍历每一个节点，并调用 patch 函数挂载它们
      vnode.children.forEach(child => {
        patch(null, child, el);
      });
    }

    // 如果 vnode.props 存在才处理它
    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key];
        patchProps(el, key, null, value);
      }
    }

    insert(el, container);
  }

  function patch(n1, n2, container) {
    if (!n1) {
      mountElement(n2, container);
    } else {
      // 打补丁
    }
  }

  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        container._vnode = '';
      }
    }
    container._vnode = vnode;
  }

  return { render };
}

function shouldSetAsProps(el, key, value) {
  // 特殊处理
  if (key === 'form' && el.tagName === 'INPUT') return false;
  // 兜底
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
  // 将属性设置相关操作封装到 patchProps 函数中，并作为渲染器选项传递
  patchProps(el, key, preValue, nextValue) {
    if (shouldSetAsProps(el, key, nextValue)) {
      // 获取该 DOM Properties 的类型
      const type = typeof el[key];
      // 如果是布尔类型，并且 nextValue 是空字符串，则将值矫正为 true
      if (type === 'boolean' && nextValue === '') {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      // 如果要设置的属性没有 DOM Properties，则使用 setAttribute 函数设置属性
      el.setAttribute(key, nextValue);
    }
  },
});

const vnode = {
  type: 'div',
  // 使用 props 描述一个元素的属性
  props: {
    id: 'foo',
  },
  children: [
    {
      type: 'p',
      children: 'hellow',
    },
    {
      type: 'button',
      props: {
        disable: '',
      },
      children: '点击',
    },
    {
      type: 'form',
      props: {
        id: 'form1',
      },
      children: [
        {
          type: 'input',
          props: {
            form: 'form1',
          },
        },
      ],
    },
  ],
};

renderer.render(vnode, document.getElementById('app'));