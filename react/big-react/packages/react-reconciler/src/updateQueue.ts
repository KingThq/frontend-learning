import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
	// 创建 Update 实例
	return {
		action
	};
};

export const createUpdateQueue = <State>(): UpdateQueue<State> => {
	// 初始化 UpdateQueue 实例
	return {
		shared: {
			pending: null
		}
	};
};

export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	// 往 updateQueue 中添加 Update
	updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memorizedState: State } => {
	// UpdateQueue 中消费 Update
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memorizedState: baseState
	};

	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState 1 update (x) => 4x --> memorizedState 4
			result.memorizedState = action(baseState);
		} else {
			// baseState 1 update 2 --> memorizedState 2
			result.memorizedState = action;
		}
	}

	return result;
};
