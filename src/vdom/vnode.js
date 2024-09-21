export default class VNode {
  constructor(instance, tag, data, key, children, text, componentOptions) {
    this.instance = instance;
    this.tag = tag;
    this.data = data;
    this.key = key;
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