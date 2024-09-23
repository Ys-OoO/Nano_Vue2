import { meregeOptions } from "../utils/options";

/**
 * 初始化子组件类，该类为 NanoVueComponent，其父类为 NanoVue
 * @param {*} NanoVue 
 */
export function initExtend(NanoVue) {
    NanoVue.cid = 0;
    let cid = 1;


    NanoVue.extend = function (extendOptions) {
        const Super = this; // 父类
        const Sub = function NanoVueComponent(baseThis, options) {
            baseThis._init(options);
        }
        // 原型继承
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;
        // 初始化子类
        Sub.cid = cid++;
        const name = extendOptions.name;
        // 合并全局mixin
        Sub.options = meregeOptions(Super.options, extendOptions);
        Sub.options.components[name] = Sub;
        Sub['super'] = Super;

        return Sub;
    }
}