import { updateDom, createDom } from './dom';
import { Fiber, DomNode, Root } from './types';

let workingRoot: Root;

export function render(element: Fiber, container: DomNode) {
  if (!(container as any)._uact) {
    const wip = {
      dom: container,
      props: {
        children: [element],
      },
      alternate: null,
    };

    const root = {
      nextUnitOfWork: wip,
      wipRoot: wip,
      deletions: [],
    };

    (container as any)._uact = root;

    performWorkNextIdle(root);
  }
}

function performWorkNextIdle(root: Root) {
  (window as any).requestIdleCallback(
    deadline => {
      workingRoot = root;
      workLoop(root, deadline);
      workingRoot = null;
      performWorkNextIdle(root);
    }
  );
}

function commitRoot(root: Root) {
  root.deletions.forEach(commitWork);
  commitWork(root.wipRoot.child);
  root.currentRoot = root.wipRoot;
  root.wipRoot = null;
}

function commitWork(fiber: Fiber) {
  if (fiber) {
    let domParentFiber = fiber.parent;

    while (!domParentFiber.dom) {
      domParentFiber = domParentFiber.parent;
    }

    for (const effect of fiber.pendingEffects) {
      effect(fiber, domParentFiber.dom);
    }

    commitWork(fiber.child);
    commitWork(fiber.sibling);
  }
}


function workLoop(root: Root, deadline: { timeRemaining(): number }) {
  let shouldYield = false;

  while (root.nextUnitOfWork && !shouldYield) {
    root.nextUnitOfWork = performUnitOfWork(root, root.nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!root.nextUnitOfWork && root.wipRoot) {
    commitRoot(root);
  }
}

function performUnitOfWork(root: Root, fiber: Fiber) {
  if (fiber.type instanceof Function) {
    updateFunctionComponent(root, fiber as Fiber<Function>)
  } else {
    updateHostComponent(root, fiber as Fiber<string>)
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function updateFunctionComponent(root: Root, fiber: Fiber<Function>) {
  root.wipFiber = fiber;
  root.wipFiber.hooks = [];
  root.hookIndex = 0;
  reconcileChildren(root, fiber, [fiber.type(fiber.props)]);
}

function updateHostComponent(root: Root, fiber: Fiber<string>) {
  fiber.dom = fiber.dom || createDom(fiber);
  reconcileChildren(root, fiber, fiber.props.children);
}

function reconcileChildren(root: Root, wip: Fiber, elements: (Fiber | string)[]) {
  let index = 0;
  let oldFiber = wip.alternate && wip.alternate.child;
  let prevSibling = null;

  if (elements) {
    while (index < elements.length) {
      const element = elements[index];

      const sameType = typeof element === 'string' ? typeof oldFiber === 'string' : (
        oldFiber && element && element.type === oldFiber.type
      );

      const props = typeof element === 'string' ? {
        nodeValue: element
      } : element.props;

      const type = typeof element === 'string' ? null : element.type;

      const newFiber: Fiber = sameType ? {
        type,
        props,
        parent: wip,
        dom: oldFiber.dom,
        alternate: oldFiber,
        pendingEffects: [commitUpdate],
      } : element ? {
        type,
        props,
        parent: wip,
        pendingEffects: [commitPlacement]
      } : null;


      if (oldFiber) {
        if (!sameType) {
          oldFiber.pendingEffects = [commitDeletion];
          root.deletions.push(oldFiber);
        }
        oldFiber = oldFiber.sibling;
      }

      if (index === 0) {
        wip.child = newFiber;
      } else if (element) {
        prevSibling.sibling = newFiber;
      }

      prevSibling = newFiber;
      index++;
    }
  }

  while (oldFiber) {
    oldFiber.pendingEffects = [commitDeletion];
    root.deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

function commitPlacement(fiber: Fiber, parent: DomNode) {
  if (fiber.dom) {
    parent.appendChild(fiber.dom);
  }
}

function commitUpdate(fiber: Fiber) {
  if (fiber.dom) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    );
  }
}

function commitDeletion(fiber: Fiber, parent: DomNode) {
  while (!fiber.dom) {
    fiber = fiber.child;
  }
  parent.removeChild(fiber.dom);
}


export function useHook(events: any = {}): [any, (state: any) => void, () => void, (f: any) => void] {
  const root = workingRoot;
  const { alternate, hooks, pendingEffects } = root.wipFiber;
  const previous = alternate ? alternate.hooks[root.hookIndex++] : null;

  const update = () => {
    root.wipRoot = {
      dom: root.currentRoot.dom,
      props: root.currentRoot.props,
      alternate: root.currentRoot
    };
    root.nextUnitOfWork = root.wipRoot;
    root.deletions = [];
  };

  return [
    previous,
    v => hooks.push(v),
    update,
    f => pendingEffects.push(f)
  ];
}
