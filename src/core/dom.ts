import { DomNode, Props, Fiber } from './types';

export function createElement<T extends (string | Function)>(
  type: T,
  props: Props,
  ...children: (Fiber | number | string)[]
): Fiber<T> {
  const childFibers = [];

  for (const child of children) {
    const type = typeof child;
    if (type === 'object') {
      childFibers.push(child);
    } else if (type === 'string') {
      childFibers.push(child);
    } else if (type === 'number') {
      childFibers.push(child.toString());
    }
  }

  return {
    type,
    props: {
      ...props,
      children: childFibers
    },
  };
}

export function createDom({ type, props }: Fiber): DomNode {
  const domNode = typeof type === 'string' ? document.createElement(type) : document.createTextNode(props.nodeValue || '');
  if (props && props.ref) {
    props.ref.current = domNode;
  }
  return updateDom(domNode, {}, props);
}

function toEventName(name: string) {
  return name.toLowerCase().substring(2);
}

export function updateDom(
  domNode: DomNode,
  prevProps: Props,
  nextProps: Props
): DomNode {
  for (const key in prevProps) {
    if (key.startsWith('on')) {
      if (prevProps[key] !== nextProps[key]) {
        domNode.removeEventListener(
          toEventName(key),
          prevProps[key]
        )
      }
    } else if (key !== 'children' && !(key in nextProps)) {
      domNode[key] = '';
    }
  }

  for (const key in nextProps) {
    if (prevProps[key] !== nextProps[key]) {
      if (key.startsWith('on')) {
        domNode.addEventListener(
          toEventName(key),
          nextProps[key]
        );
      } else if (key !== 'children') {
        domNode[key] = nextProps[key];
      }
    }
  }

  return domNode;
}
