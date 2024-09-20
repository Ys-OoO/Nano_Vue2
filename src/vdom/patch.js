import { isDef, isUndef } from "../utils/index";

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

function createELm(vnode) {
  let { tag, data, children, text, instance } = vnode;

  if (isDef(tag)) { // 创建元素节点
    vnode.el = document.createElement(tag);
    if (children.length) {
      for (let i = 0; i < children.length; ++i) {
        const child = createELm(children[i]);
        vnode.el.appendChild(child);
      }
    }
  } else {
    //创建文本节点
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

/**
 * 将 
 * @param {} oldVnode 老的虚拟节点
 * @param {} vnode 新的虚拟节点
 */
export function patch(oldVnode, vnode) {

  if (isUndef(oldVnode)) { // 不存在旧虚拟节点，一般为未传递 $el 时
    createELm(vnode);
  } else {
    const isRealElement = isDef(oldVnode.nodeType);
    if (!isRealElement && sameVnode(oldVnode, vnode)) { // （旧的节点不是真实DOM，且新旧vnode相同） 
      // 细粒度更新，Vue会尝试复用现有的DOM结构并只更新必要的部分，而不是完全重建DOM树
    } else {
      
      const parentElm = oldVnode.parentNode;
      if (isRealElement) { // 旧节点是真实DOM ———— 首次挂载，此时oldVnode 一般为 #app的DOM
        /**
         * 删除旧节点:
         *  1. 根据vnode创建新的DOM并插入
         *  2. 删除旧DOM
        */
        //创建新节点
        let elm = createELm(vnode);
        vnode.elm = elm;
        //插入
        parentElm.insertBefore(elm, oldVnode.nextSibiling);

        // 删除旧节点
        if (isDef(parentElm)) {
          parentElm.removeChild(oldVnode);
        }
      }
    }
  }

  return vnode.elm;
}