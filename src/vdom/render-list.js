import { isArray, isObject } from "../utils/index.js";

/**
 * 实例的 _l 渲染函数，转会为虚拟节点
 * @param {*} val
 * @param {*} render
 * @returns
 */
export function renderList(val, render) {
  let ret = null;
  if (isArray(val)) {
    ret = new Array(val.length);
    for (let i = 0; i < ret.length; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === "number") {
    for (let i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    const keys = Object.keys(val);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      ret[i] = render(val[key], key, i);
    }
  } else {
    ret = [];
  }
  console.log(ret);
  return ret;
}
