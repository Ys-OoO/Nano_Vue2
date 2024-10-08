export function isFunc(arg) {
  return typeof arg === "function";
}


export function isPrimitive(value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}


export function isObject(arg) {
  return typeof arg === "object" && arg !== null;
}

export function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

export function isArray(arg) {
  return isObject(arg) && arg.constructor === Array;
}

export function toString(val) {
  return val == null
    ? ""
    : Array.isArray(val) ||
      (isPlainObject(val) && val.toString === Object.prototype.toString)
      ? JSON.stringify(val)
      : String(val);
}

export function isUndef(v) {
  return v === undefined || v === null;
}

export function isDef(v) {
  return v !== undefined && v !== null;
}

export function parsePath(path) {
  const segments = path.split(".");
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}

export function makeMap(str) {
  const map = Object.create(null);
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return (val) => map[val.toLowerCase()];
}


/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g
export const camelize = (str) => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
}

/**
 * Capitalize a string.
 */
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}