import { isObject, isUndef } from "../utils/index.js";
import VNode from "./vnode.js";

export function createComponent(Ctor, tag, data, context, children) {
    if (isUndef(Ctor)) {
        return;
    }

    // 父类构造函数
    const baseCtor = context.$options._base;

    if (isObject(Ctor)) { // 当组件是内部自定义的组件时，其Ctor初始为对象，此时应该将其转为 NanoVueComponent子类
        Ctor = baseCtor.extend(Ctor);
    }

    data = data || {};

    // 源码注释：为组件安装用于管理组件的Hooks
    installComponentHooks(data, Ctor);

    const listeners = data.on;
    const vnode = new VNode(context, `nanovue-component-${Ctor.cid}-${tag}`, data, children, undefined, { Ctor, listeners });
    return vnode;
}

/**
 * 
 */
function installComponentHooks(data, Ctor) {
    // 添加init hook
    data.hook = {
        init(vnode) {
            // 初始化组件，调用NanoVueComponent构造函数并执行_init
            // vnode.componentInstance 用于创建真实DOM时使用 --> ./patch/createComponent()
            const subInstance = vnode.componentInstance = new Ctor({ _isComponent: true }); // Ctor 是 NanoVueComponent 构造函数 
            // 由于组件并没有 $options.el 属性，因此需要手动调用挂载
            // !此时还不知道挂载的目标，在执行完成后会将组件模板根标签作为$el挂载到subInstance上，具体流程看$mount对组件的处理
            subInstance.$mount();
        }
    }
}