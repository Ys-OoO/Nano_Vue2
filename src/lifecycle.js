import Watcher from './observer/watcher.js';
import { patch } from './vdom/patch.js';

export function lifecycleMixin(NanoVue) {
  NanoVue.prototype._update = function (vnode) {
    const instance = this;
    const { $el } = instance;

    // 将虚拟DOM vnode 转换为 真实DOM 并替换/更新 $el
    instance.$el = patch($el, vnode);
  }
}

export function mountComponent(instance, el) {
  // 组件更新的方法，方便数据改变时调用 
  let updateComponent;

  /**
   * render -> VDOm -> DOM
   */
  updateComponent = () => {
    // 调用渲染函数，生成虚拟DOM(VNode)：\src\render.js
    const vnode = instance._render();
    // 生成真实DOM并挂载
    instance._update(vnode);
  }

  // 实现响应式 (数据驱动视图) 观察者模式
  new Watcher(instance, updateComponent, () => { }, {});
}