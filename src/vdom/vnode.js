export default class VNode {
  constructor(instance, tag, data, children, text, componentOptions) {
    this.instance = instance;
    this.tag = tag;
    this.data = data;
    this.key = data && data.key;
    this.children = children;
    this.text = text;
    this.componentOptions = componentOptions;
  }
}

export const createEmptyVNode = (text = '') => {
  const node = new VNode();
  node.text = text;
  return node;
}