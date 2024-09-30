import { createComponent } from './create-component.js';
import { isReservedTag } from '../utils/elements.js';
import VNode from './vnode.js';
import { camelize, capitalize, isArray, isPrimitive } from '../utils/index.js';
import { createTextVNode } from './create-text.js';

const ALWAYS_NORMALIZE = 2
/**
 * 渲染函数: _c
 */
export function createElement(instance, tag, data, children, normalizationType) {
  const context = instance;
  let vnode;
  let Ctor;

  // 扁平化孩子节点
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  }
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


// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
// 该函数主要是将 vnode.children 进行规范化，例如将字符串转换为TextVNode, 将数组扁平化等
export function normalizeChildren(children) {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function normalizeArrayChildren(children) {
  // 这里先只是简单的解决v-for使用的问题：
  // e.g. 当使用<div><h1>title</h1><li v-for="..."></li><div>  会生成Vnode：{tag:'div',children:[Vnode(h1),[Vnode(for li)]]}
  // 这里会产生嵌套的孩子节点，导致无法正确的patch
  let res = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isArray(child)) {
      res = [...res, ...child];
    } else {
      res.push(child);
    }
  }
  return res;
}