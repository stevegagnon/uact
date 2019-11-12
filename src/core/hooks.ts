import { useHook } from './reconciler';
import { argsChanged } from './shared';

export type HookAction<T> = (t: T) => T;

export function useState<T>(state: T): [T, (t: (t: T) => T) => unknown] {
  const queue = [];

  const [oldHook, pushHook, update] = useHook();

  if (oldHook) {
    state = oldHook.state;
    for (const action of oldHook.queue) {
      state = action(state);
    }
  }

  const setState = (action: HookAction<T>) => {
    queue.push(action);
    update();
  }

  pushHook({ state, queue });

  return [state, setState];
}

export function useReducer(reducer, initialState) {
  const [state, setState] = useState(initialState);

  const dispatch = action => setState(state => reducer(state, action));

  return [state, dispatch];
}

export function useEffect(callback, state) {
  const [previous, push] = useHook({
    attach: () => {
      if (!previous || argsChanged(previous.state, state)) {
        callback();
      }
    }
  });

  push({ state });
}

export function useRef<T>(state: T): { current: T } {
  const [oldHook, pushHook] = useHook();

  const current = oldHook ? oldHook.state : { current: state };

  pushHook({ state: current });

  return current;
}
