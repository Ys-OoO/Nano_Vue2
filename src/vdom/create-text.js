import VNode from './vnode.js';
export function createTextVNode(instance, text) {
  return new VNode(instance, undefined, undefined, undefined, text, undefined);
}