import { createComponent } from './create-component';
import VNode from './vnode';

export function createElement(instance, tag, data, children) {
  const context = instance;
  let vnode;
  vnode = createComponent(tag, data, context, children);
  return vnode;
}