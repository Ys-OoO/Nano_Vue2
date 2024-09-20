import VNode from './vnode';

export function createElement(instance, tag, data ,children) {
  return new VNode(instance, tag, data, data && data.key , children, undefined);
}