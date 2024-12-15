export default class VNode {
    constructor(instance, tag, data, children, text, componentOptions) {
        this.instance = instance;
        this.tag = tag;
        this.data = data;
        this.key = data && data.key;
        this.children = children;
        this.text = text;
        this.componentOptions = componentOptions;

        // 这是SSR使用的属性
        // SSR 实际上有自己的一套compiler，将html转换为ast和渲染函数
        // 但是为了实现简单的SSR，这里直接魔法
        this.isString = text ? true : false;
    }
}

export const createEmptyVNode = (text = "") => {
    const node = new VNode();
    node.text = text;
    return node;
};
