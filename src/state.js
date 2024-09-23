import Dep from './observer/dep.js';
import { observe, set } from "./observer/index.js";
import Watcher from "./observer/watcher.js";
import { isFunc, isPlainObject } from "./utils/index.js";
/**
 * @example 
 * data(){
 *    return {
 *      obj:{a:1},
 *      arr:[1,2,3]
 *    }
 * }
 * 这个数据最终会挂载到instance._data下，
 * 但是我们希望this.obj/instance.obj是可以访问到的，而不需要this._data.xxx
 * 因此进行代理，代理的对象不仅限于data配置项
 * !代理和劫持的优势：相比于在原型链上增加属性以达到同样的效果，代理的存取更高效，原型链查找低效
 * 
 * @param {NanoVue} instance 实例
 * @param {string} sourceName 存储状态/方法的私有属性名，这里可以是 _data、...
 * @param {string} key 私有属性中的外层属性
 */
function proxy(instance, sourceName, key) {
  Object.defineProperty(instance, key, {
    get() {
      return instance[sourceName][key];
    },
    set(newValu) {
      instance[sourceName][key] = newValu;
    }
  })
}

/**
 * 初始化 data
 * 1. 代理data，使其能够直接通过实例或this获取
 * 2. 将 data 上的所有数据进行数据劫持/监听
 * 3. 绑定到实例_data属性上
 * @param {*} instance 
 */
function initData(instance) {
  const options = instance.$options;
  let data;
  if (isFunc(options.data)) { //绑定this，并调用获取
    data = options.data.call(instance);
  } else {
    data = options.data;
  }

  //绑定到实例上
  instance._data = data;

  //对data进行代理
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      proxy(instance, '_data', key);
    }
  }

  //监听data--实际上就是将data中的属性重新定义
  observe(data);
}

function initComputed(instance, computedOpts) {
  const watchers = (instance._computedWatchers = Object.create(null));

  for (const key in computedOpts) {
    const userDef = computedOpts[key]; // 用户的配置，可能只有getter，可能有getter也有setter
    const getter = isFunc(userDef) ? userDef : userDef.get;

    // 创建 Computed Watcher
    watchers[key] = new Watcher(instance, getter, () => { }, {
      lazy: true, // Coputed Watcher的标识
    })

    // 对computed key 进行劫持
    defineComputed(instance, key, userDef);
  }
}


function defineComputed(instance, key, userDef) {
  const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: () => { },
    set: () => { }
  }

  if (isFunc(userDef)) {
    sharedPropertyDefinition.get = createComputedGetter(key);
  } else {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = userDef.set;
  }
  Object.defineProperty(instance, key, sharedPropertyDefinition);
}

function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers[key];

    if (watcher) {
      // dirty 表示该watcher是否需要重新计算
      if (watcher.dirty) {
        watcher.evaluate();
      }

      // evaluate执行完后，相关属性会收集到对应的Computed Watcher
      // 但是此时改变了相关属性并不会触发试图更新，因为相关的属性没有收集 Render Watcher
      // 因此这里进一步收集 Render Watcher
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  }
}

/**
 * 初始化 watch
 * 1. 遍历opts, 获取每一项的handler
 * 2. 为每一个watch目标创建Watcher
 */
function initWatch(instance, watchOpts) {
  for (const key in watchOpts) {
    const handler = watchOpts[key]; // 是回调函数
    // 创建Watcher
    createWatcher(instance, key, handler);
  }
}

function createWatcher(instance, expOrFn, handler, options) {
  // 处理 watch 配置
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }

  return instance.$watch(expOrFn, handler, options);
}

/**
 * 初始化状态
 * 包括：data, computed, watch
 */
export default function initState(instance) {
  const options = instance.$options;
  // init data
  if (options.data) {
    initData(instance);
  }

  // init computed
  if (options.computed) {
    initComputed(instance, options.computed);
  }

  // init watch
  if (options.watch) {
    initWatch(instance, options.watch);
  }
}

export function stateMixin(NanoVue) {
  NanoVue.prototype.$set = set;


  NanoVue.prototype.$watch = function (expOrFn, cb, options) {
    const instance = this;
    if (isPlainObject(cb)) {
      return createWatcher(instance, expOrFn, cb, options);
    }

    options = options || {};
    options.user = true; // 标识该watcher为 User Watcher

    // 创建 watcher
    const watcher = new Watcher(instance, expOrFn, cb, options);

    if (options.immediate) {
      cb.call(instance, watcher.value, undefined);
    }

    // 返回取消watch的函数
    return function unwatchFn() {
      watcher.teardown();
    }
  }
}