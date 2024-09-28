import { createComponent } from './create-component.js';
import { isReservedTag } from '../utils/elements.js';
import VNode from './vnode.js';

/**
 * 渲染函数: _c
 */
export function createElement(instance, tag, data, children) {
  const context = instance;
  let vnode;
  let Ctor;
  if (isReservedTag(tag)) {
    // 原生标签
    vnode = new VNode(instance, tag, data, children.length ? children : null, undefined, undefined);
  } else if ((Ctor = resolveComponent(instance.$options.components, tag))) {
    // component
    vnode = createComponent(Ctor, tag, data, context, children.length ? children : null);
  } else {
    // Unknow Tag
    vnode = new VNode(instance, tag, data, children.length ? children : null, undefined, undefined);
  }

  return vnode;
}

/**
 * 判断$options.components中是否存在tag，支持驼峰和短横线命名
 * @param {*} componentOptions  $options.components
 * @param {*} tag 
 * @returns Ctor，可能是来源于全局组件的NanoVueComponent，也可能是内部子组件的配置对象
 */
function resolveComponent(componentOptions, tag) {
  if (componentOptions[tag]) {
    return componentOptions[tag];
  }
  const camelizedTag = camelize(tag)
  if (componentOptions[camelizedTag]) {
    return componentOptions[camelizedTag];
  }
  const PascalCaseTag = capitalize(camelizedTag)
  if (componentOptions[PascalCaseTag]) {
    return componentOptions[PascalCaseTag];
  }

  console.error(`Failed to resolve component [${tag}]`);
  return undefined;
}