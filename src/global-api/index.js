import { initExtend } from "./extend";
import { initMixin } from "./mixin";

export function initGlobalApi(NanoVue) {
    // 全局options，不属于某个实例
    NanoVue.options = Object.create(null);

    // 注入NanoVue.mixin
    initMixin(NanoVue);

    // 注入NanoVue.extend
    initExtend(NanoVue);
    // 注入NanoVue.component
    // ---用于标识基础构造函数 NanoVue，以便子组件更方便的寻找 NanoVue
    NanoVue.options._base = NanoVue;
    // ---初始化components配置
    NanoVue.options.components = {};
    NanoVue.component = function (id, definition) {
        definition.name = definition.name || id;
        // ---调用NanoVue.extend 生成子类构造函数
        definition = this.options._base.extend(definition);
        this.options.components[id] = definition;
        return definition;
    }
}