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
        const Sub = function NanoVueComponent(options) {
            this._init(options); // this是子类实例, _init方法在下面原型继承时Super.prototype上，也是就NanoVue.prototype
        }
        // 原型继承
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;

        Sub.cid = cid++;
        const name = extendOptions.name;
        // 合并全局mixin, 使全局的mixin也应用到组件类上
        Sub.options = meregeOptions(Super.options, extendOptions);
        // 源码注释：启用递归自查询
        // if (name) {
        //     Sub.options.components[name] = Sub;
        // }
        Sub['super'] = Super;

        return Sub;
    }
}