import { isArray, isDef, isUndef } from "../utils/index.js";
import { updateAttrs } from "./attrs.js";
import VNode from "./vnode.js";

const emptyNode = new VNode(undefined, "", {}, []);

// ~ BEGIN : 一些内部方法
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    isDef(a.data) === isDef(b.data) &&
    sameInputType(a, b)
  );
}
function sameInputType(a, b) {
  if (a.tag !== "input") return true;
  let i;
  const typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type;
  const typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type;
  return typeA === typeB;
}

function addVnodes(parentElm, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; startIdx++) {
    const vnode = vnodes[startIdx];
    const el = createElm(vnode);
    parentElm.appendChild(el);
  }
}

function removeVnodes(vnodes, startIdx, endIdx, parentElm) {
  for (; startIdx <= endIdx; startIdx++) {
    const ch = vnodes[startIdx];
    if (isDef(ch)) {
      const parent = ch.parent || parentElm;
      if (isDef(parent)) {
        parent.removeChild(ch.elm);
      }
    }
  }
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  let i, key;
  const map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map;
}

function findIdxInOld(node, oldCh, start, end) {
  for (let i = start; i < end; i++) {
    const c = oldCh[i];
    if (isDef(c) && sameVnode(node, c)) return i;
  }
}
// ~ END : 一些内部方法

/**
 * 根据虚拟节点创建组件
 * 根据vnode.data.hook 判断是否是组件
 *    是组件就调用init进行初始化 & 手动挂载$mount
 */
function createComponent(vnode) {
  let i = vnode.data;
  if (isDef(i)) {
    if (isDef((i = i.hook) && isDef((i = i.init)))) {
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
  if (createComponent(vnode)) {
    // 尝试创建组件
    // 组件创建完成后，会将组件的根元素挂载到vnode.componentInstance.$el上
    // 此时组件的DOM已经全部创建完成，因此仅需要将这一部分作为孩子挂载即可
    return vnode.componentInstance.$el;
  }

  if (isDef(tag)) {
    // 创建元素节点
    vnode.elm = document.createElement(tag);
    if (children && children.length) {
      for (let i = 0; i < children.length; ++i) {
        const childV = children[i];
        if (isArray(childV)) {
          // 使用v-for，则其产生的一组子节点将作为当前vnode的一个孩子，故需要特殊处理
          // <li v-for="item in 3"></li> => vnode:{children:[vnode,vnode,vnode]}
          for (let i = 0; i < childV.length; i++) {
            let childDom = createElm(childV[i]);
            vnode.elm.appendChild(childDom);
          }
        } else {
          const childDom = createElm(childV);

          if (isDef(data)) {
            // 添加属性，源码中使用的是invokeCreateHooks,
            // 传入的oldVnode为一个空的Vnode，表示为初次添加属性
            updateAttrs(emptyNode, vnode);
          }

          vnode.elm.appendChild(childDom);
        }
      }
    }
  } else {
    //创建文本节点
    vnode.elm = document.createTextNode(text);
  }
  return vnode.elm;
}

/**
 * * 核心Diff（同层比较 & 双端索引）：当两个节点tag相同时，且都存在子节点时的Diff
 * 同层比较：只会比较同一层级的节点，即oldCh和newCh的关系
 * 双端索引：分别指向oldCh和newCh的首尾
 *
 * ^对比情况有：新头===旧头  新尾===旧尾  旧头===新尾 旧尾===新头 四者都不相等
 */
function updateChildren(parentElm, oldCh, newCh) {
  debugger;
  // 双指针
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newEndIdx = newCh.length - 1;

  // 指针对应的初始节点
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];

  // 乱序时使用
  let oldKeyToIdxMap; // oldCh中各节点key:idx的map key为节点的key，idx为节点在oldCh中的索引
  let idxInOld; // oldKeyToIdxMap[oldVnode.key]
  let vnodeToMove; // 需要移动的节点

  // 遍历新旧子节点列表的最小长度
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      // ^新头===旧头
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // ^新尾===旧尾
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // ^旧头===新尾
      patchVnode(oldStartVnode, newEndVnode);
      // 移动：将旧头移动到旧尾的下一个的前面
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // ^旧尾===新头
      patchVnode(oldEndVnode, newStartVnode);
      //移动：将旧尾移动到旧头前面
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      if (isUndef(oldKeyToIdxMap))
        // 生成oldCh的{key:idx}的map
        oldKeyToIdxMap = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      // 查找newStartVnode是否可复用
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdxMap[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
      if (isUndef(idxInOld)) {
        // 没有找到可复用的oldVnode
        const elm = createElm(newStartVnode);
        parentElm.appendChild(elm);
      } else {
        // 可以复用
        vnodeToMove = oldCh[idxInOld];
        if (sameVnode(vnodeToMove, newStartVnode)) {
          // 更新属性等，处理子节点
          patchVnode(vnodeToMove, newStartVnode, newCh, newStartIdx);
          oldCh[idxInOld] = undefined;
          // 插入
          parentElm.insertBefore(vnodeToMove.elm, oldStartVnode.elm);
        } else {
          // same key but different element. treat as new element
          const elm = createElm(newStartVnode);
          parentElm.appendChild(elm);
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }

  // ^ 此时oldCh和newCh中最短项已经处理完了，接下来要处理剩余部分
  if (oldStartIdx > oldEndIdx) {
    // newCh没处理完，添加对应节点
    addVnodes(parentElm, newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    // oldCh没处理完,删除对应节点
    removeVnodes(oldCh, oldStartIdx, oldEndIdx, parentElm);
  }
}

/**
 * * Diff
 * 旧的节点不是真实DOM，且新旧vnode相同
 * 针对相同tag的VNode进行更细粒度的 初始化 & diff
 * @param {*} oldVnode
 * @param {*} vnode
 */
function patchVnode(oldVnode, vnode, chList, index) {
  if (oldVnode === vnode) return;

  const elm = (vnode.elm = oldVnode.elm);

  // 处理标签属性attrs,style,class,源码中对应 invokeCreateHooks
  if (isDef(vnode.data)) {
    updateAttrs(oldVnode, vnode);
  }

  /**
   * ^处理子节点 分别考虑以下情况:
   *    * 双方都有子节点
   *    * 一方有子节点，一方没有
   *      分解为：
   *        & 旧节点没有子节点&新节点有子节点
   *        & 旧节点有子节点&新节点没有子节点
   */
  const oldCh = oldVnode.children;
  const ch = vnode.children;

  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      // * 都有子节点
      updateChildren(elm, oldCh, ch);
    } else if (isDef(ch)) {
      // & 旧节点没有子节点&新节点有子节点
      if (isDef(oldVnode.text)) elm.textContent = ""; // 清空旧的文本节点
      addVnodes(elm, ch, 0, ch.length - 1);
    } else if (isDef(oldCh)) {
      // & 旧节点有子节点 & 新节点没有子节点
      // !这个分支貌似无法触发，因为使用v-if的节点会默认生成空节点，源码中这里只做了移除多余旧子节点
      // !所以先不考虑该case，直接暴力修改DOM
      removeVnodes(oldCh, 0, oldCh.length - 1);
      elm.innerHTML = ``;
    }
  } else {
    // 处理文本节点
    if (oldVnode.text !== vnode.text) {
      elm.textContent = vnode.text;
    }
  }
}
/**
 * 根据虚拟节点生成真实DOM并挂载
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
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // *（旧的节点不是真实DOM，且新旧vnode相同）
      // 细粒度更新，Vue会尝试复用现有的虚拟DOM结构并只更新必要的部分，而不是完全重建DOM树
      patchVnode(oldVnode, vnode);
    } else {
      const parentElm = oldVnode.parentNode;
      if (isRealElement) {
        // *旧节点是真实DOM ———— 首次挂载，此时oldVnode 一般为 #app的DOM
        /**
         * 删除旧节点:
         *  1. 根据vnode创建新的DOM并插入
         *  2. 删除旧DOM
         */
        //创建新节点
        let elm = createElm(vnode);
        vnode.elm = elm;
        //插入
        parentElm.insertBefore(elm, oldVnode.nextSibling);

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
