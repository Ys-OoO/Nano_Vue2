import { isUndef } from "../../utils/index.js";
import VNode from "../vnode";

const emptyNode = new VNode(undefined, "", {}, []);

function updateDOMListeners(oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
        return;
    }
    const on = vnode.data.on || {};
    const oldOn = oldVnode.data.on || {};
    let target = vnode.elm || oldVnode.elm;
    // BEGIN 绑定事件
    for (let name in on) {
        let curEventHandler = on[name];
        let oldEventHandler = oldOn[name];

        if (isUndef(curEventHandler)) {
            console.warn(`Invalid handler for event "${name}"`);
        } else if (isUndef(oldEventHandler)) { // 初始化时
            // 包装回调（高阶函数）：判断是否触发源正确，源码中还需要判断事件触发事件是否在Schduler执行所有异步任务后
            // !暂不支持同一DOM绑定多个相同事件
            const original = curEventHandler;
            original._wrapper = function (e) {
                if (e.target === e.currentTarget) {
                    return original.apply(this, arguments);
                }
            }
            target.addEventListener(name, original._wrapper);
        } else if (curEventHandler !== oldEventHandler) { // Diff时
            // 如果绑定的是一个匿名函数，则会出现如下case，因为渲染函数重新执行创建了新的函数，而不是当前实例的
            // 但是此时是复用逻辑
            console.warn('Error: update event listener');
        }
    }
    // END
    // 移除老节点中的事件监听
    for (let name in oldOn) {
        if (isUndef(on[name])) {
            const oldEventHandler = on[name];
            target.removeEventListener(name, oldEventHandler._wrapper || oldEventHandler);
        }
    }
}

export default {
    update: updateDOMListeners,
    destory: (vnode) => updateDOMListeners(vnode, emptyNode)
}