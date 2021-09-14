/**
 * @title 极简 useState 实现
 */

let isMount = true;
// 当前正在执行的 hook
let wordInProgressHook = null;

const fiber = {
  memorizedState: null, // 保存 hooks 的数据（链表）
  stateNode: App,
};

// 模拟 schedule、render、commit 阶段
function run() {
  // hooks 初始化
  wordInProgressHook = fiber.memorizedState;
  // render
  const app = fiber.stateNode();
  // commit
  isMount = false;
  return app;
}

// 创建 update 并将这些 update 形成一条环状链表
function dispatchAction(queue, action) {
  const update = {
    action,
    next: null,
  };

  if (queue.pending === null) {
    update.next = update;
  } else {
    // 3 -> 0 -> 1 -> 2 -> 3
    // 4 -> 0 -> 1 -> 2 -> 3 -> 4
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  // 将指向最后一个 update 的指针指向当前的 update
  queue.pending = update;

  run();
}

function useState(initialState) {
  let hook;

  if (isMount) {
    hook = {
      queue: {
        pending: null, // 环状链表保存
      },
      memorizedState: initialState,
      next: null,
    };

    if (!fiber.memorizedState) {
      fiber.memorizedState = hook;
    } else {
      wordInProgressHook.next = hook;
    }
    wordInProgressHook = hook;
  } else {
    hook = wordInProgressHook;
    wordInProgressHook = wordInProgressHook.next;
  }

  // 因为省略了优先级的概念则 baseState = memorizedState
  let baseState = hook.memorizedState;
  if (hook.queue.pending) {
    // 存在则表示该 hook 上有需要计算的 update
    let firstUpdate = hook.queue.pending.next;

    // 遍历链表直到不等于第一个 update 为止
    do {
      const action = firstUpdate.action;
      baseState = action(baseState);
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending.next);

    hook.queue.pending = null;
  }
  hook.memorizedState = baseState;

  return [baseState, dispatchAction.bind(null, hook.queue)];
}

function App() {
  const [num, setNum] = useState(0);
  const [status, setStatus] = useState(false);

  console.log("isMount:", isMount);
  console.log("num:", num);
  console.log("status:", status);

  return {
    onClick: () => {
      setNum((num) => num + 1);
      // setNum(num => num + 1);
      // setNum(num => num + 1);
    },
    trigger: () => {
      setStatus((status) => !status);
    },
  };
}

const app = run();
app.onClick();
app.onClick();
app.onClick();
app.trigger();
