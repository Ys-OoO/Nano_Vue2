/*
* @author Ys_OoO
* 源码使用构造函数实现，这里也可以采用es6 class实现
* 这里沿用构造函数的实现方式
*/

import initMixin from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './render';
import { stateMixin } from './state';

function NanoVue(options) {
  // do init
  this._init(options);
}

// !扩展原型
// 注入初始化方法 : _init()
initMixin(NanoVue);

// 注入
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

export default NanoVue;