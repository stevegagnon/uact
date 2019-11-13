import { DomNode, Props, Fiber } from './types';

function createStringFiber(nodeValue: string) {
  return {
    form: updateTextDom,
    props: {
      nodeValue
    },
  };
}

export function createElement<T extends (string | Function)>(
  type: T,
  props: Props,
  ...children: (Fiber | number | string)[]
): Fiber<T> {
  const childFibers = [];

  for (const child of children) {
    switch (typeof child) {
      case 'object': childFibers.push(child); break;
      case 'string': childFibers.push(createStringFiber(child)); break;
      case 'number': childFibers.push(createStringFiber(child.toString())); break;
    }
  }

  return {
    form: updateDom,
    type,
    props: {
      ...props,
      children: childFibers
    },
  };
}

export function createDom(fiber: Fiber<string>): DomNode {
  if (fiber.form === updateTextDom) {
    return document.createTextNode(fiber.props.nodeValue);
  } else {
    const domNode = document.createElement(fiber.type);
    if (fiber.props && fiber.props.ref) {
      fiber.props.ref.current = domNode;
    }
    return updateDom(domNode, {}, fiber.props);
  }
}

function toEventName(name: string) {
  return name.toLowerCase().substring(2);
}

export function updateTextDom(
  domNode: DomNode,
  prevProps: Props,
  nextProps: Props
): DomNode {
  if (prevProps.nodeValue !== nextProps.nodeValue) {
    domNode.nodeValue = nextProps.nodeValue;
  }
  return domNode;
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
