/**
 * @title 组件的实现原理
 */

const Text = Symbol();
const Comment = Symbol();
const Fragment = Symbol();

const { reactive, effect, shallowReactive, shallowReadonly, ref } = VueReactivity;

// 任务缓存队列，用一个 Set 数据结构表示，这样可以自动对任务去重
const queue = new Set();
// 一个状态，代表是否正在刷新任务队列
let isFlushing = false;
// 创建一个立即 resolve 的 promise 实例
const p = Promise.resolve();

// 全局变量，存储当前正在被初始化的组件实例
let currentInstance = null;
// 该方法接受组件实例作为参数，并将该实例设置为 currentInstance
function setCurrentInstance(instance) {
  currentInstance = instance;
}

function createRenderer(options) {
  const {
    createElement,
    setElementText,
    insert,
    patchProps,
    createText,
    setText,
    createComment,
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
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      }
      setElementText(container, n2.children);
    } else if (Array.isArray(n2.children)) {
      patchKeyedChildren(n1, n2, container);
    } else {
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

    // 处理相同的前置索引
    let j = 0;
    let oldVNode = oldChildren[j];
    let newVNode = newChildren[j];
    while (oldVNode.key === newVNode.key) {
      patch(oldVNode, newVNode, container);
      j++;
      oldVNode = oldChildren[j];
      newVNode = newChildren[j];
    }

    // 处理相同的后置元素
    let oldEnd = oldChildren.length - 1;
    let newEnd = newChildren.length - 1;
    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];
    while (oldVNode.key === newVNode.key) {
      patch(oldVNode, newVNode, container);
      oldEnd--;
      newEnd--;
      oldVNode = oldChildren[oldEnd];
      newVNode = newChildren[newEnd];
    }

    if (oldEnd < j && newEnd >= j) {
      // j -- newEnd 之间为新增元素
      const anchorIndex = newEnd + 1;
      const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;
      while (j <= newEnd) {
        patch(null, newChildren[j++], container, anchor);
      }
    } else if (newEnd < j && oldEnd >= j) {
      // j -- oldEnd 之间的元素需要删除
      while (j <= oldEnd) {
        unmount(oldChildren[j++]);
      }
    } else {
      // 非理想状况
      // 构建 source 数组
      const count = newEnd - j + 1;
      const source = new Array(count).fill(-1);

      const oldStart = j;
      const newStart = j;
      let moved = false;
      let pos = 0;
      const keyIndex = {};
      for (let i = newStart; i <= newEnd; i++) {
        keyIndex[newChildren[i].key] = i;
      }

      // 更新过的节点数量
      let patched = 0;
      for (let i = oldStart; i <= oldEnd; i++) {
        oldVNode = oldChildren[i];
        if (patched <= count) {
          const k = keyIndex[oldVNode.key];
          if (typeof k !== 'undefined') {
            newVNode = newChildren[k];
            patch(oldVNode, newVNode, container);
            patched++;
            source[k - newStart] = i;
            // 判断是否需要移动
            if (k < pos) {
              moved = true;
            } else {
              pos = k;
            }
          } else {
            unmount(oldVNode);
          }
        } else {
          umount(oldVNode);
        }
      }
    }

    if (moved) {
      // 需要进行 DOM 移动操作
      // 计算最长递增子序列，返回下标索引
      const seq = getSeruence(source);

      let s = seq.length - 1;
      let i = count - 1;
      for (i; i >= 0; i--) {
        if (source[i] === -1) {
          // 说明索引为 i 的节点是全新的节点，应该将其挂载
          const pos = i + newStart;
          const newVNode = newChildren[pos];
          const nextPos = pos + 1;
          const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
          patch(null, newVNode, container, anchor);
        } else if (seq[s] !== i) {
          // 如果节点的索引 i 不等于 seq[s] 的值，说明节点需要移动
          const pos = i + newStart;
          const newVNode = newChildren[pos];
          const nextPos = pos + 1;
          const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
          insert(newVNode.el, container, anchor);
        } else {
          // 当 i === seq[s] 时，说明该位置的节点不需要移动
          s--;
        }
      }
    }
  }

  function mountComponent(vnode, container, anchor) {
    // 通过 vnode 获取组件的选项对象，即 vnode.type
    const componentOptions = vnode.type;
    // 获取组件的渲染函数及生命周期函数等
    let {
      render,
      data,
      beforeCreate,
      created,
      beforeMount,
      mounted,
      beforeUpdate,
      updated,
      props: propsOption,
      setup,
    } = componentOptions;

    // 在这里调用 beforeCreate 钩子
    beforeCreate && beforeCreate();

    // 调用 data 函数得到原始数据，并调用 reactive 函数将其包装为响应式数据
    const state = data ? reactive(data()) : null;
    // 调用 resolveProps 函数解析出最终的 props 数据和 attrs 数据
    const [props, attrs] = resolveProps(propsOption, vnode.props);

    const slots = vnode.children || {};
    
    // 定义组件实例，一个组件实例本质上就是一个对象，它包含与组件有关的状态信息
    const instance = {
      // 组件自身的状态数据，即 data
      state,
      // 将解析出的 props 数据包装为 shallowReactive 并定义到组件实例上
      props: shallowReactive(props),
      // 用来表示组件是否已经被挂载，初始值为 false
      isMounted: false,
      // 组件所渲染的内容，即子树（subTree）
      subTree: null,
      // 将插槽添加到组件实例上
      slots,
      // 用来存储通过 onMounted 函数注册的生命周期钩子函数
      mounted: [],
    };

    // 定义 emit 函数
    function emit(event, ...payload) {
      // 根绝约定对事件名称进行处理，如 change --> onChange
      const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
      // 根据处理后的事件名称去 props 中寻找对应的事件处理函数
      const handle = instance.props[eventName];
      if (handle) {
        // 调用事件处理函数并传递参数
        handle(...payload);
      } else {
        console.error('不存在');
      }
    }

    // setupContext
    const setupContext = { attrs, emit, slots };
    // 在调用 setup 函数之前，设置当前组件实例
    setCurrentInstance(instance);
    // 调用 setup 函数，将只读版本的 props 作为第一个参数传递，避免用户意外的修改 props 的值
    // 将 setupContext 作为第二个参数传递
    const setupResult = setup && setup(shallowReadonly(instance.props), setupContext);
    // 在 setup 函数执行完毕后，重置当前组件实例
    setCurrentInstance(null);
    // setupState 用来存储由 setup 返回的数据
    let setupState = null;
    // 如果 setup 函数的返回值是函数，则将其视为渲染函数
    if (typeof setupResult === 'function') {
      if (render) {
        console.error('setup 函数返回渲染函数，render 选项将忽略');
      }
      render = setupResult;
    } else {
      // 返回值不是函数，则作为数据状态赋值给 setupState
      setupState = setupResult;
    }

    // 将组件实例设置到 vnode 上，用于后续更新
    vnode.component = instance;

    // 创建渲染上下文对象，本质上是组件实例的代理
    const renderContext = new Proxy(instance, {
      get(t, k, r) {
        // 取得组件自身状态与 props 等数据
        const { state, props, slots } = t;
        // 当 k 的值为 $slots 时，直接返回组件实例上的 slots
        if (k === '$slots') return slots;
        // 先尝试读取自身状态数据
        if (state && k in state) {
          return state[k];
        }
        if (k in props) {
          // 如果组件自身没有该数据，则尝试从 props 中读取
          return props[k];
        }
        if (setupState && k in setupState) {
          // 渲染上下文需要增加对 setupState 的支持
          return setupState[k];
        }
        console.error('不存在');
      },
      set(t, k, v, r) {
        const { state, props } = t;
        if (state && k in state) {
          state[k] = v;
        } else if (k in props) {
          console.warn(`Attempting to mutate prop "${k}". Props are readonly.`);
        } else if (setupState && k in setupState) {
          // 渲染上下文需要增加对 setupState 的支持
          setupState[k] = v;
        } else {
          console.error('不存在');
        }
      },
    });

    // 生命周期函数调用时要绑定渲染上下文对象
    // 在这里调用 created 钩子
    created && created.call(renderContext);

    effect(() => {
      // 执行渲染函数，获取组件要渲染的内容，即 render 函数返回的虚拟 DOM
      // 调用 render 函数时，将其 this 设置为 state，
      // 从而 render 函数内部可以通过 this 访问组件自身状态数据
      const subTree = render.call(renderContext, renderContext);
      // 检查组件是否已经被挂载
      if (!instance.isMounted) {
        // 在这里调用 beforeMount 钩子
        beforeMount && beforeMount.call(renderContext);
        // 初次挂载
        patch(null, subTree, container, anchor);
        // 重点：将组件实例的 isMounted 设置为 true，这样当更新发生时就不会再次进行挂载操作
        // 而是会执行更新
        instance.isMounted = true;
        // 在这里调用 mounted 钩子
        mounted && mounted.call(renderContext);
        // 遍历 instance.mounted 数组并逐个执行
        instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext));
      } else {
        // 在这里调用 beforeUpdate 钩子
        beforeUpdate && beforeUpdate.call(renderContext);
        // 当 isMounted 为 true 时，说明组件已经被挂载，只需要完成自更新即可
        // 在调用 patch 函数时，第一个参数为组件上一次渲染的子树
        // 意思是，使用新的子树与上一次渲染的子树进行打补丁操作
        patch(instance.subTree, subTree, container, anchor);
        // 在这里调用 updated 钩子
        updated && updated.call(renderContext);
      }
      // 更新组件实例的子树
      instance.subTree = subTree;
    }, {
      // 指定该副作用函数的调度器
      scheduler: queueJob,
    });
  }

  function patchComponent(n1, n2, anchor) {
    // 获取组件实例，即 n1.component，同时让新的组件虚拟节点 n2.component 也指向组件实例
    const instance = (n2.component = n1.component);
    // 获取当前的 props 数据
    const { props } = instance;
    // 调用 hasPropsChanged 检测为子组件的传递的 props 是否发生变化，如果没有变化，则不需要更新
    if (hasPropsChanged(n1.props, n2.props)) {
      // 调用 resolveProps 函数重新获取 props 数据
      const [nextProps] = resolveProps(n2.type.props, n2.props);
      // 更新 props
      for (const k in nextProps) {
        props[k] = nextProps[k];
      }
      // 删除不存在的 props
      for (const k in props) {
        if (!(k in nextProps)) {
          delete props[k];
        }
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
    } else if (typeof type === 'object') {
      // vnode.type 的值是选项对象，作为组件来处理
      if (!n1) {
        // 挂载组件
        mountComponent(n2, container, anchor);
      } else {
        // 更新组件
        patchComponent(n1, n2, anchor);
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

  return { render }
}

function unmount(vnode) {
  if (vnode.type === Fragment) {
    vnode.children.forEach(c => unmount(c));
    return;
  }
  const parent = vnode.el.parentNode;
  if (parent) {
    parent.removeChild(vnode.el);
  }
}

function onMounted(fn) {
  if (currentInstance) {
    // 将生命周期函数添加到 instance.mounted 数组中
    currentInstance.mounted.push(fn);
  } else {
    console.error('onMounted 函数只能在 setup 中调用');
  }
}

// 调度器的主要函数，用来将一个任务添加到缓存队列中，并开始刷新队列
function queueJob(job) {
  queue.add(job);
  // 如果还没有开始刷新队列。则刷新
  if (!isFlushing) {
    // 将标志设置为 true 避免重复刷新
    isFlushing = true;
    // 在微任务队列中刷新缓冲队列
    p.then(() => {
      try {
        // 执行任务队列中的任务
        queue.forEach(job => job());
      } finally {
        // 重置状态
        isFlushing = false;
        queue.clear();
      }
    });
  }
}

// resolveProps 函数用于解析组件 props 和 attrs 数据
function resolveProps(options, propsData) {
  const props = {};
  const attrs = {};
  // 遍历为组件传递的 props 数据
  for (const key in propsData) {
    if (key in options || key.startsWith('on')) {
      // 如果为组件传递的 props 数据在组件自身的 props 选项中有定义，则将其视为合法的 props
      // 以字符串 on 开头的 props，无论是否显示的声明，都将其添加到 props 数据中
      props[key] = propsData[key];
    } else {
      // 否则将其作为 attrs
      attrs[key] = propsData[key];
    }
  }
  return [props, attrs];
}

function hasPropsChanged(prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps);
  // 如果新旧 props 的数量变了，则说明有变化
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }

  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    // 有不相等的 props，则说明有变化
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}

function shouldSetAsProps(el, key, value) {
  if (key === 'form' && el.tagName === 'INPUT') return false;
  return key in el;
}

const renderer = createRenderer({
  createElement(type) {
    return document.createElement(type);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  createComment(comment) {
    return document.createComment(comment);
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  setText(el, text) {
    el.nodeValue = text;
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
  patchProps(el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
      const invokers = el._vei || (el._vei = {});
      let invoker = invokers[key];
      const name = key.slice(2).toLowerCase();
      if (nextValue) {
        if (!invoker) {
          invoker = el._vei[key] = (e) => {
            // e.timeStamp 是事件发生的时间
            // 如果事件发生的时间早于事件处理函数绑定的时间，则不执行事件处理函数
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


const obj = reactive({ foo: 'hellow world' });

effect(() => {
  console.log(obj.foo);
})
const MyComponent = {
  name: 'MyComponent',
  props: {
    title: String,
  },
  // 用 data 函数来定义组件自身的状态
  data() {
    return {
      foo: obj.foo,
    };
  },
  // 组件的渲染函数，其返回值必须是虚拟 DOM
  render() {
    return {
      type: 'div',
      children: `我是一个组件，foo 的值是：${this.foo}，title 的值是：${this.title}`,
    };
  }
};
const Comp = {
  setup() {
    // setup 函数可以返回一个函数，该函数将作为组件的渲染函数
    return () => {
      return { type: 'div', children: 'hello' };
    }
  }
};
const Comp2 = {
  props: {
    foo: String,
  },
  setup(props, setupContext) {
    props.foo; // 访问传入的 props 数据
    // setupContent 中包含与组件接口相关的重要数据
    const { slots, emit, attrs, expose } = setupContext;
    // slots：组件接收到的插槽
    // emit：一个函数，用来发射自定义事件
    // attrs：当为组件传递 props 时，那些没有显示的声明为 props 的属性会存储到 attrs 对象中
    // expose：一个函数，用来显示的对外暴露组件数据

    emit('change', 1, 2);

    onMounted(() => {
      console.log('mounted1');
    });
    onMounted(() => {
      console.log('mounted2');
    });

    const count = ref(0);
    // 返回一个对象，对象中的数据会暴露到渲染函数中
    return { count };
  },
  render() {
    // 通过 this 可以访问 setup 暴露出来的响应式数据
    this.count.value++;
    // return {
    //   type: 'div',
    //   children: `count is: ${this.count.value}，foo is ${this.foo}`,
    // }
    
    // 插槽
    return {
      type: 'div',
      children: [this.$slots.header()],
    };
    // return [
    //   {
    //     type: 'div',
    //     children: [this.$slots.header()],
    //   },
    //   {
    //     type: 'div',
    //     children: [this.$slots.body()],
    //   },
    //   {
    //     type: 'div',
    //     children: [this.$slots.footer()],
    //   },
    // ];
  }
};

const compVNode = {
  type: MyComponent,
  props: {
    title: 'big title',
  },
};
const compVNode2 = {
  type: MyComponent,
  props: {
    title: 'small title'
  },
};
const compVNode3 = {
  type: Comp2,
  props: {
    foo: 100,
    onChange: (arg1, arg2) => {
      console.log('args:', arg1, arg2);
    },
  },
  // 插槽
  children: {
    header() {
      return { type: 'h1', children: '我是标题' };
    },
    body() {
      return { type: 'section', children: '我是内容' };
    },
    footer() {
      return { type: 'p', children: '我是注脚' };
    },
  }
};

// renderer.render(compVNode, document.getElementById('app'));
renderer.render(compVNode3, document.getElementById('app'));
setTimeout(() => {
  obj.foo = 'hello world2';
  // renderer.render(compVNode2, document.getElementById('app'));
}, 2000);
