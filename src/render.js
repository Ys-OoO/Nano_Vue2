import { toString } from "./utils/index.js";
import { nextTick } from "./utils/next-tick.js";
import { createElement } from "./vdom/create-element.js";
import { createTextVNode } from "./vdom/create-text.js";
import { renderList } from "./vdom/render-list.js";
export function initRender(instance) {
  instance._c = (tag, data, children, normalizationType) => createElement(instance, tag, data, children, normalizationType);
  instance._v = (text) => createTextVNode(instance, text);
  instance._s = (s) => toString(s);

  instance._l = (list, render) => renderList(list, render);
}

export function renderMixin(NanoVue) {
  NanoVue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this);
  };

  NanoVue.prototype._render = function () {
    const instance = this;
    let { render } = instance.$options;

    // 调用渲染函数，生成虚拟节点
    // 调用后就会调用_c等函数
    let vnode = render.call(instance);

    return vnode;
  };
}
