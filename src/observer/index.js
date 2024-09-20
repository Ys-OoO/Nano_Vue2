import { isArray, isObject } from "../utils/index.js";
import Dep from "./dep.js";
import { nanoArray } from "./nano_array.js";

class Observer {
  dep  //为实现数组的响应式，数组相关方法调用触发视图更新

  constructor(data) {
    // 把Observer实例赋值到data上，提供给其他地方使用
    // data.__ob__ = this;
    this.dep = new Dep();
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false, // 避免Observer实例被劫持造成死循环
    });

    if (isArray(data)) { // 特殊处理数组
      data.__proto__ = nanoArray;

      this.observeArray(data);
    } else { // 对象
      this.travel(data);
    }
  }

  /**
   * 遍历数据，并将其劫持（响应式化）
   */
  travel(data) {
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key]);
    })
  }

  observeArray(data) {
    data.forEach(item => {
      observe(item);
    })
  }
}

/**
 * !全量劫持，这也是Vue2性能差的原因之一
 */
function defineReactive(data, key, value) {
  observe(value); //如果值为对象，在这里会被进一步劫持

  let dep = new Dep();
  const childOb = observe(value); // 获取Observer,可能是数组的，也可能是新增对象的
  Object.defineProperty(data, key, {
    enumerable:true,
    configurable:true,
    get() {
      if(Dep.target){ // 如果观察者存在，收集依赖
        dep.depend();

        if(childOb){
          childOb.dep.depend(); // 进行依赖收集
          if(isArray(value)){ // 如果是数组
            dependArray(value); // 对数组内的子数组递归进行依赖收集
          }
        }
      }
      return value;
    },
    set(newValue) {
      if(value !== newValue){
        // !Vue2缺陷：当新增了一个对象时进行劫持，但是新增非对象的其他属性时不会劫持，导致其失去响应式
        observe(newValue); //如果设置的新值是对象，在这里会被劫持
        value = newValue;
        dep.notify(); // 由依赖通知观察者更新
      }
    }
  })

  return dep;
}

/**
 * 数据劫持: 监听数据的 读取操作
 * @param {*} data 
 */
export function observe(data) {
  if (!isObject(data)) {
    return;
  }

  if(data.__ob__){ // 用于获取已经被观测状态的 Observer
    return data.__ob__;
  }

  return new Observer(data);
}

/**
 * 对数组内的子数组递归进行依赖收集
 * @param {Array} value 
 */
function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    if (e && e.__ob__) {
      e.__ob__.dep.depend();
    }
    if (isArray(e)) {
      dependArray(e);
    }
  }
}

export function set(target,key,value){
  const ob = target.__ob__;

  if(!ob){
    target[key] = value;
    return value;
  }
  defineReactive(target,key,value);

  ob.dep.notify();

  return value;
}

