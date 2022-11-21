/**
 * @title 快速 Diff 算法
 */

const Text = Symbol();
const Comment = Symbol();
const Fragment = Symbol();

function createRenderer(options) {
  const {
    createElement,
    createText,
    createComment,
    insert,
    setElementText,
    setText,
    patchProps,
  } = options;

  function mountElement(vnode, container, anchor) {
    const el = vnode.el = createElement(vnode.type);
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(c => patch(null, c, el));
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
      // 子节点为 string
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      }
      setElementText(container, n2.children);
    } else if (Array.isArray(n2.children)) {
      // Diff
      patchKeyedChildren(n1, n2, container);
    } else {
      // 子节点不存在
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      } else if (typeof n1.children === 'string') {
        setElementText(container, '');
      }
    }
  }

  function patchKeyedChildren(n1, n2, container) {
    const oldChildren = n1.children;
    const newChildren = n2.children;

    // 更新相同的前置节点
    // 索引 j 指向新旧两组子节点的开头
    let j = 0;
    let oldVNode = oldChildren[j];
    let newVNode = oldChildren[j];
    // while 循环向后遍历，直到遇到拥有不同 key 值的节点为止
    while (oldVNode.key === newVNode.key) {
      patch(oldVNode, newVNode, container);
      // 更新索引 j，让其自增
      j++;
      oldVNode = oldChildren[j];
      newVNode = newChildren[j];
    }

    // 更新相同的后置节点
    // 索引 oldEnd 指向旧的一组子节点的最后一个节点
    let oldEnd = oldChildren.length - 1;
    // 缩影 newEnd 指向新的一组子节点的最后一个节点
    let newEnd = newChildren.length - 1;
    
    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];

    // while 循环从后向前遍历，直到遇到拥有不同 key 值的节点为止
    while (oldVNode.key === newVNode.key) {
      patch(oldVNode, newVNode, container);
      // 递减 oldEnd 和 newEnd
      oldEnd--;
      newEnd--;
      oldVNode = oldChildren[oldEnd];
      newVNode = newChildren[newEnd];
    }

    // 处理新增节点
    // 预处理完毕后，如果满足如下条件，则说明 j --> newEnd 之间的节点应作为新节点插入
    if (oldEnd < j && newEnd >= j) {
      // 锚点的索引
      const anchorIndex = newEnd + 1;
      // 锚点元素
      const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;
      // 采用 while 循环，调用 patch 函数逐个挂载新增节点
      while (j <= newEnd) {
        patch(null, newChildren[j++], container, anchor);
      }
    } else if (oldEnd >= j && newEnd < j) {
      // 处理删除节点的情况
      // j --> oldEnd 之间的节点应该被卸载
      while (j <= oldEnd) {
        unmount(oldChildren[j++]);
      }
    } else {
      // 非理想状况下的处理
      // 构建 source 数组
      // 新的一组子节点中未处理的节点数量
      const count = newEnd - j + 1;
      const source = new Array(count);
      source.fill(-1);

      // oldStart 和 newStart 分别为起始索引，即 j
      const oldStart = j;
      const newStart = j;
      // 新增两个变量 moved 和 pos
      let moved = false;
      let pos = 0;
      // 构建索引表
      const keyIndex = {};
      for (let i = newStart; i <= newEnd; i++) {
        keyIndex[newChildren[i].key] = i;
      }
      // 新增 patched 变量，代表更新过的节点数量
      let patched = 0;
      // 遍历旧的一组子节点中剩余未处理的节点
      for (let i = oldStart; i <= oldEnd; i++) {
        oldVNode = oldChildren[i];
        // 如果更新过的节点数量<=需要更新的节点数量，则执行更新
        if (patched <= count) {
          // 通过索引表快速找到新的一组子节点中具有相同 key 值的节点位置
          const k = keyIndex[oldVNode.key];
          if (typeof k !== 'undefined') {
            newVNode = newChildren[k];
            patch(oldVNode, newVNode, container);
            // 每更新一个节点，都将 patched 变量 +1
            patched++;
            // 填充 source 数组
            source[k - newStart] = i;
            // 判断节点是否需要移动
            if (k < pos) {
              moved = true;
            } else {
              pos = k;
            }
          } else {
            // 没找到
            unmount(oldVNode);
          }
        } else {
          // 如果更新过的节点数量>需要更新的节点数量，则卸载多余的节点
          unmount(oldVNode);
        }
      }

      if (moved) {
        // 如果 moved 为真，则需要进行 DOM 移动操作
        // 计算最长递增子序列，返回下标索引
        const seq = getSeruence(source); // [0, 1]

        // s 指向最长递增子序列的最后一个元素
        let s = seq.length - 1;
        // i 指向新的一组子节点的最后一个元素
        let i = count - 1;
        for (i; i >= 0; i--) {
          if (source[i] === -1) {
            // 说明索引为 i 的节点时全新的节点，应该将其挂载
            // 该节点在新 children 中的真实位置索引
            const pos = i + newStart;
            const newVNode = newChildren[pos];
            // 该节点的下一个节点的位置索引
            const nextPos = pos + 1;
            const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
            patch(null, newVNode, container, anchor);
          } else if (seq[s] !== i) {
            // 如果节点的索引 i 不等于 seq[s] 的值，说明节点需要移动
            // 该节点在新的一组子节点中的真实位置索引
            const pos = i + newStart;
            const newVNode = newChildren[pos];
            // 该节点的下一个节点的位置索引
            const nextPos = pos + 1;
            const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
            insert(newVNode.el, container, anchor);
          } else {
            // 当 i === seq[s] 时，说明该位置的节点不需要移动
            // 只需要让 s 指向下一个位置
            s--;
          }
        }
      }
    }
  }

  function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
      umount(n1);
      n1 = null;
    }
    const { type } = n2;
    if (typeof type === 'string') {
      if (!n1) {
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
  createText(text) {
    return document.createTextNode(text);
  },
  createComment(comment) {
    return document.createComment(comment);
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  setText(el, text) {
    el.nodeValue = text;
  },
  patchProps(el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
      // 处理事件
      const invokers = el._vei || (el._vei = {});
      let invoker = invokers[key];
      const name = key.slice(2).toLowerCase();
      if (nextValue) {
        if (!invoker) {
          invoker = el._vei[key] = (e) => {
            if (e.timeStamp < el.attached) return;
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach(fn => fn(e));
            } else {
              invoker.value(e);
            }
          };
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
  },
});


/** 测试用例 */
// 理想状况下
const oldVNode = {
  type: 'div',
  children: [
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '2', key: 2 },
    { type: 'p', children: '3', key: 3 },
  ],
};
const newVNode = {
  type: 'div',
  children: [
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '4', key: 4 },
    { type: 'p', children: '2', key: 2 },
    { type: 'p', children: '3', key: 3 },
  ],
};

// 非理想状况下
const oldVNode2 = {
  type: 'div',
  children: [
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '2', key: 2 },
    { type: 'p', children: '3', key: 3 },
    { type: 'p', children: '4', key: 4 },
    { type: 'p', children: '6', key: 6 },
    { type: 'p', children: '5', key: 5 },
  ],
};
const newVNode2 = {
  type: 'div',
  children: [
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '3', key: 3 },
    { type: 'p', children: '4', key: 4 },
    { type: 'p', children: '2', key: 2 },
    { type: 'p', children: '7', key: 7 },
    { type: 'p', children: '5', key: 5 },
  ],
};

renderer.render(oldVNode2, document.getElementById('app'));
setTimeout(() => {
  renderer.render(newVNode2, document.getElementById('app'));
}, 3000);