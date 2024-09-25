import { isUndef } from "../utils/index.js";

/**
 * 为真实DOM 生成/更新Attrs
 * @param {*} oldVnode // ^初次添加属性时，为 空Vnode, 具体使用见patch.js中的patchVnode和creatElm
 * @param {*} vnode 
 */
export function updateAttrs(oldVnode, vnode) {
    let key, cur, old;
    const elm = vnode.elm;
    const oldAttrs = oldVnode.data;
    let attrs = vnode.data;

    // 设置新节点的属性
    for (key in attrs) {
        cur = attrs[key];
        old = oldAttrs[key];
        if (old !== cur) {
            elm.setAttribute(key, cur);
        }
    }

    // 删除新节点没有的属性，老节点有的属性
    for (key in oldAttrs) {
        cur = attrs[key];
        old = oldAttrs[key];
        if (isUndef(cur)) {
            elm.removeAttribute(key);
        }
    }
}