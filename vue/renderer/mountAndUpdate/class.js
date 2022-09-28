/**
 * @title class 的处理
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
        container.innerHTML = '';
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
  patchProps(el, key, prevValue, nextValue) {
    // 对 class 进行特殊处理
    // el.calssName 性能最优
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
  },
});

function normalizeClass(classnames) {
  if (Array.isArray(classnames)) {
    const cls = classnames.reduce((pre, current) => {
      if (typeof current === 'string') {
        pre = `${pre} ${current}`; 
      } else {
        for (const key in current) {
          pre = `${pre} ${key}`;
        }
      }
      return pre;
    }, '');
    return cls.trim();
  }
  if (typeof classnames === 'string') {
    return classnames;
  }
  // class: { bar: true }
  let cls = '';
  for (const key in classnames) {
    cls = `${cls} ${key}`;
  }
  return cls.trim();
}

const vnode = {
  type: 'p',
  props: {
    // 使用 normalizeClass 函数将不同类型的 class 值正常化为字符串
    // class: normalizeClass([
    //   'foo bar',
    //   { baz: true },
    // ]),
    // class: normalizeClass('foo'),
    class: normalizeClass({ bb: true }),
  },
  children: 'p 标签',
};

renderer.render(vnode, document.getElementById('app'));