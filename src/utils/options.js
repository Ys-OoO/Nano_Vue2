import { isObject } from "./index.js";
import { LIFECYCLE_HOOKS } from './constants.js';

const meregeStrategy = {} // 合并策略

// 生命周期钩子 合并规则设置
LIFECYCLE_HOOKS.forEach(hook => {
    // 生命周期的合并策略 合并到数组
    meregeStrategy[hook] = function (cur, added) {
        const hookList = cur || [];
        added && hookList.push(added);
        return hookList;
    }
})

// components 合并规则
meregeStrategy.components = function (parentVal, childVal) {
    // 创建一个新的对象，继承父类实例，这里实际就是 NanoVue.options.components[key];
    const res = Object.create(parentVal || null);
    // 将实例配置拷贝到新对象并返回
    if (childVal) {
        for (const key in childVal) {
            res[key] = childVal[key];
        }
    }
    return res;
}
/**
 * 使用策略模式 合并options
 */
export function meregeOptions(parent, child) {
    const options = {};
    let key;
    for (key in parent) {
        mergeField(key);
    }

    for (key in child) {
        if (!Object.prototype.hasOwnProperty.call(parent, key)) {
            mergeField(key);
        }
    }

    function mergeField(key) {
        const strategy = meregeStrategy[key] || defaultStrategy; // 获取对应策略
        options[key] = strategy(parent[key], child[key]);
    }
    return options;
}

function defaultStrategy(parentVal, childVal) {
    if (isObject(parentVal) && isObject(childVal)) {
        return { ...parentVal, ...childVal }
    } else {
        return childVal === undefined ? parentVal : childVal;
    }
}