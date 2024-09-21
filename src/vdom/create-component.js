import VNode from "./vnode";

export function createComponent(tag, data, context, children) {

    // 处理事件相关信息 data.on

    const listeners = data.on;
    return new VNode(context, tag, data, undefined, children, undefined, { listeners });
}