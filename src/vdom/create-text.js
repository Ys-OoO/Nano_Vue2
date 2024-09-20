import VNode from './vnode';
export function createTextVNode(instance, text){
  return new VNode(instance,undefined,undefined,undefined,undefined,text);
}