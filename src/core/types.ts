export type DomNode = HTMLElement | Text;

interface Ref {
  current: any;
}

export interface Props {
  children?: Fiber[],
  ref?: Ref,
  nodeValue?: string,
  [key: string]: any,
}

type FiberEffect = (fiber: Fiber, parent?: DomNode) => void;

export interface Fiber<T = string | Function> {
  form?: Function,
  type?: T,
  parent?: Fiber,
  alternate?: Fiber<T>,
  child?: Fiber,
  sibling?: Fiber,
  dom?: DomNode,
  pendingEffects?: FiberEffect[],
  props: Props,
  hooks?: any[],
  value?: string;
}

export interface Root {
  nextUnitOfWork: Fiber,
  currentRoot?: Fiber,
  wipRoot: Fiber,
  deletions: Fiber[],
  wipFiber?: Fiber,
  hookIndex?: number,
}
