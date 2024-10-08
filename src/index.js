/*
* @author Ys_OoO
* 源码使用构造函数实现，这里也可以采用es6 class实现
* 这里沿用构造函数的实现方式
*/

import { initGlobalApi } from './global-api/index.js';
import initMixin from './init.js';
import { lifecycleMixin } from './lifecycle.js';
import { renderMixin } from './render.js';
import { stateMixin } from './state.js';

function NanoVue(options) {
  // do init
  this._init(options);
}

// !扩展原型
// 注入初始化方法 : _init()
initMixin(NanoVue);
/**
 * _render()将渲染函数转换为虚拟DOM
 * _update()更新虚拟DOM
 */
// 注入创建虚拟DOM的方法 : _render()
// 注入 $nextTick
renderMixin(NanoVue);
// 注入更新虚拟DOM的方法 : _update()
lifecycleMixin(NanoVue);
// 注入 $set $watch
stateMixin(NanoVue);

// !扩展类
// 初始化全局API : mixin
initGlobalApi(NanoVue);

export default NanoVue;