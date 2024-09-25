import { compileToFunctions } from './compiler/index.js';
import { mountComponent } from './lifecycle.js';
import { initRender } from './render.js';
import initState from './state.js';
import { meregeOptions } from './utils/options.js';

/**
 * 初始化实例：
 * el, data, computed, watch
 * $options, $mount
 * 渲染函数_c, _s, _v
 */
function init(options) {
  const instance = this;
  // 合并配置项，并将配置项注册到实例上
  instance.$options = meregeOptions(instance.constructor.options, options);

  // 初始化状态
  initState(instance);
  // 初始化 渲染函数render所需的方法：_s _v _c
  initRender(instance);

  if (instance.$options.el) {
    //执行挂载流程
    instance.$mount(instance.$options.el);
  }
}

/**
 * 挂载
 * 1. 将模板转化为渲染函数
 * 2. 执行渲染函数构造虚拟DOM Tree
 * 3. 根据虚拟DOM生成/更新真实DOM
 * @param {string} containerEle 容器id
 */
function mount(containerEle) {
  const instance = this;
  const container = document.querySelector(containerEle);
  instance.$el = container;

  // Began 1.将模板转化为渲染函数
  // 如果配置项中没有render函数，则获取并解析模板生成渲染函数
  if (!instance.$options.render) {
    let template = instance.$options.template;
    if (!template && container) {
      // 没有配置template选项，但是能够获取容器
      // 将容器本身及其内容作为模板
      template = container.outerHTML;
    }
    //生成渲染函数并挂载到实例配置项上
    let render = compileToFunctions(template);
    instance.$options.render = render;
  }
  // 此时当前实例必有render渲染函数

  // Began 2. 执行渲染函数构造虚拟DOM Tree & 3. 根据虚拟DOM生成/更新真实DOM
  mountComponent(instance, container);
}

export default function initMixin(NanoVue) {
  // 注入初始化方法
  NanoVue.prototype._init = init;

  // 注入挂载方法
  NanoVue.prototype.$mount = mount;

}
