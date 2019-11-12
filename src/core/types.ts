
export type DomNode = HTMLElement | Text;

interface Ref {
  current: any;
}

export interface Props {
  children?: (Fiber | string)[];
  ref?: Ref;
  nodeValue?: string;
}

type FiberEffect = (fiber: Fiber, parent?: DomNode) => void;

export interface Fiber<T = string | Function> {
  type?: T,
  parent?: Fiber,
  alternate?: Fiber<T>,
  child?: Fiber,
  sibling?: Fiber,
  dom?: DomNode,
  pendingEffects?: FiberEffect[],
  props: Props,
  hooks?: any[],
}

export interface Root {
  nextUnitOfWork: Fiber,
  currentRoot?: Fiber,
  wipRoot: Fiber,
  deletions: Fiber[],
  wipFiber?: Fiber,
  hookIndex?: number,
}
