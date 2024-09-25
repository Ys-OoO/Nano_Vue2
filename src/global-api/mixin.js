import { meregeOptions } from "../utils/options.js";

/**
 * 初始化混入（为全局的NanoVue类追加mixin方法）,提供链式调用
 * 用来收集每次 mixin({...}) 的传入
 */
export function initMixin(NanoVue) {
    NanoVue.mixin = function (mixin) {
        this.options = meregeOptions(this.options, mixin);
        return this;
    }
}