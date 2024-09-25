import { toString } from './utils/index.js';
import { nextTick } from './utils/next-tick.js';
import { createElement } from './vdom/create-element.js';
import { createTextVNode } from './vdom/create-text.js';
export function initRender(instance) {
  instance._c = (tag, data, children) => createElement(instance, tag, data, children);
  instance._v = (t) => createTextVNode(instance, t);
  instance._s = (s) => toString(s);
}

export function renderMixin(NanoVue) {
  NanoVue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this);
  }

  NanoVue.prototype._render = function () {
    const instance = this;
    let { render } = instance.$options;

    // 调用渲染函数，生成虚拟节点
    // 调用后就会调用_c等函数
    let vnode = render.call(instance);
    return vnode;
  }
}