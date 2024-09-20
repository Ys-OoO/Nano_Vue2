export default class VNode {
  constructor(instance,tag,data,key,children,text){
    this.instance = instance;
    this.tag = tag;
    this.data = data;
    this.key = key;
    this.children = children;
    this.text = text;
  }
}

export const createEmptyVNode = (text = '') => {
  const node = new VNode();
  node.text = text;
  return node;
}