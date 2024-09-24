import { createComponent } from './create-component';
import { isReservedTag } from '../utils/elements';
import VNode from './vnode';

/**
 * 渲染函数: _c
 */
export function createElement(instance, tag, data, children) {
  const context = instance;
  let vnode;
  let Ctor;
  if (isReservedTag(tag)) {
    // 原生标签
    vnode = new VNode(instance, tag, data, children, undefined, undefined);
  } else if ((Ctor = resolveComponent(instance.$options.components, tag))) {
    // component
    vnode = createComponent(Ctor, tag, data, context, children);
  } else {
    // Unknow Tag
    vnode = new VNode(instance, tag, data, children, undefined, undefined);
  }

  return vnode;
}

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