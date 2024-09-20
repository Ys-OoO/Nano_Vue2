let originalPrototype = Array.prototype;
export let nanoArray = Object.create(Array.prototype);

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

methodsToPatch.forEach(method => {
  // 存储原始方法
  const original = originalPrototype[method];

  // 重写方法
  nanoArray[method] = function (...args) {
    // 执行原始逻辑
    const result = originalPrototype[method].apply(this, args);

    let inserted; // 新增的数据
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
      default:
        break;
    }
    // 对新增的数据进行响应式处理
    if(inserted) this.__ob__.observeArray(insertValue);
    // 每个数组都会有__ob__指向其Observer，其中回保存一个Dep用于触发更新
    this.__ob__.dep.notify();
    
    return result
  }
})