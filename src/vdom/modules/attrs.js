import { isUndef } from "../../utils/index.js";

/**
 * 为真实DOM 生成/更新Attrs
 * @param {*} oldVnode // ^初次添加属性时，为 空Vnode, 具体使用见patch.js中的patchVnode和creatElm
 * @param {*} vnode 
 */
export function updateAttrs(oldVnode, vnode) {
    // 由于这里简化了对style和class的处理，因此不直接拦截
    // if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    //     return;
    // }

    let key, cur, old;
    const elm = vnode.elm;
    const oldAttrs = oldVnode.data.attrs || {};
    let attrs = vnode.data.attrs || {};
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

    // !添加/更新 class和style 源码中在其他地方调用，这里做简化
    vnode.data.class && elm.setAttribute('class', vnode.data.class);
    if (vnode.data.style) {
        const style = vnode.data.style;
        for (const key in style) {
            elm.style[key] = style[key];
        }
    }
    if (oldVnode.data.style) {
        const oldStyle = oldVnode.data.style;
        const style = vnode.data.style;
        if (!style) {
            elm.style = '';
        } else {
            for (const key in oldStyle) {
                elm.style[key] = style?.[key] || '';
            }
        }
    }
}