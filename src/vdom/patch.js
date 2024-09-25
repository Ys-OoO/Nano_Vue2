import { isDef, isUndef } from "../utils/index.js";
import { updateAttrs } from "./attrs.js";
import VNode from "./vnode.js";

const emptyNode = new VNode(undefined, '', {}, []);

function sameVnode(a, b) {
  return (
    a.key === b.key &&
    ((a.tag === b.tag &&
      isDef(a.data) === isDef(b.data) &&
      sameInputType(a, b))
    )
  )
}
function sameInputType(a, b) {
  if (a.tag !== 'input') return true
  let i
  const typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type
  const typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type
  return typeA === typeB
}

/**
 * 根据虚拟节点创建组件
 * 根据vnode.data.hook 判断是否是组件
 *    是组件就调用init进行初始化 & 手动挂载$mount
 */
function createComponent(vnode) {
  let i = vnode.data;
  if (isDef(i)) {
    if (isDef((i = i.hook) && isDef(i = i.init))) {
      i(vnode); // 执行ComponentVNode 的 init方法
    }

    if (isDef(vnode.componentInstance)) {
      // 组件NanoVueComponent已经实例化
      return true;
    }
  }
  return false;
}

/**
 * 根据虚拟节点创建真实DOM
 * 递归终止条件：
 * 1. 没有孩子了
 * 2. 是组件
 *    a. 执行组件的初始化、挂载
 *    b. 返回挂载的$el
 */
function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (createComponent(vnode)) { // 尝试创建组件
    // 组件创建完成后，会将组件的根元素挂载到vnode.componentInstance.$el上
    // 此时组件的DOM已经全部创建完成，因此仅需要将这一部分作为孩子挂载即可
    return vnode.componentInstance.$el;
  }

  if (isDef(tag)) { // 创建元素节点
    vnode.elm = document.createElement(tag);
    if (children.length) {
      for (let i = 0; i < children.length; ++i) {
        const child = createElm(children[i]);

        if (isDef(data)) {
          // 添加属性，源码中使用的是invokeCreateHooks,
          // 传入的oldVnode为一个空的Vnode，表示为初次添加属性
          updateAttrs(emptyNode, vnode);
        }

        vnode.elm.appendChild(child);
      }
    }
  } else {
    //创建文本节点
    vnode.elm = document.createTextNode(text);
  }
  return vnode.elm;
}

/**
 * 针对相同tag的VNode进行更细粒度的 初始化/diff
 * @param {*} oldVnode 
 * @param {*} vnode 
 */
function patchVnode(oldVnode, vnode) {
  if (oldVnode === vnode) return

  const elm = (vnode.elm = oldVnode.elm);

  // 处理标签属性attrs,存放于data
  if (isDef(vnode.data)) {
    updateAttrs(oldVnode, vnode);
  }

  // 处理文本节点
}
/**
 * 根据虚拟节点生成真实DOM并挂载
 * ......后续还会承载一些Diff的工作
 * @param {} oldVnode 老的虚拟节点
 * @param {} vnode 新的虚拟节点
 */
export function patch(oldVnode, vnode) {
  if (isUndef(oldVnode)) {
    // *不存在旧虚拟节点，说明当前为 **组件** ，无对应的$el选项，因此也没有oldVnode
    // 源码注释：空挂载（可能作为组件），创建新的根元素
    createElm(vnode);
  } else {
    const isRealElement = isDef(oldVnode.nodeType);
    if (!isRealElement && sameVnode(oldVnode, vnode)) { // *（旧的节点不是真实DOM，且新旧vnode相同） 
      // 细粒度更新，Vue会尝试复用现有的虚拟DOM结构并只更新必要的部分，而不是完全重建DOM树
      patchVnode(oldVnode, vnode);
    } else {
      const parentElm = oldVnode.parentNode;
      if (isRealElement) { // *旧节点是真实DOM ———— 首次挂载，此时oldVnode 一般为 #app的DOM
        /**
         * 删除旧节点:
         *  1. 根据vnode创建新的DOM并插入
         *  2. 删除旧DOM
        */
        //创建新节点
        let elm = createElm(vnode);
        vnode.elm = elm;
        //插入
        parentElm.insertBefore(elm, oldVnode.nextSibiling);

        // 删除旧节点
        if (isDef(parentElm)) {
          parentElm.removeChild(oldVnode);
        }
      } else {
        // *旧的节点不是真实DOM，且新旧vnode不相同
        // *直接替换，不再 diff 子节点

        //创建新节点
        vnode.elm = createElm(vnode);

        // 替换
        oldVnode.elm.parentNode.replaceChild(vnode.elm, oldVnode.elm);
      }
    }
  }

  return vnode.elm;
}