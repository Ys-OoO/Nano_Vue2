import { parsePath } from "../utils/index.js";
import { popTarget, pushTarget } from "./dep.js";
import { queueWatcher } from "./schduler.js";
// !一个组件对应一个Watcher 一个Watcher需要监听组件内模板使用到的所有属性，所以需要监听所有依赖的属性
// ! 将Watcher 分为 RenderWatcher UserWatcher ComputedWatcher/LazyWatcher
// ! UserWatcher标识：user
// ! ComputedWatcher/LazyWatcher标识：lazy

let id = 0;
export default class Watcher {
  constructor(instance, expOrFn, cb, options) {
    this.instance = instance;
    this.expOrFn = expOrFn;
    this.cb = cb;
    this.options = options;

    // User Watcher
    this.user = !!options.user;

    // Computed Watcher
    this.lazy = !!options.lazy;
    this.dirty = this.lazy;

    this.id = id++;

    this.deps = []; // 存储当前watcher 所观察的依赖
    this.depsIds = new Set(); // 存储依赖的id

    // 处理expOrFn
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn; // 取名为getter是因为该函数执行会去当前实例上 获取最新的数据
    } else {
      this.getter = parsePath(expOrFn); // 此时会触发在实例上通过代理获取data中的数据，同时触发了defineProperty.get收集依赖
    }

    // 因为watch配置项的回调需要新旧两个值，因此需要保存
    // computed watcher （lazy） 创建时不需要执行
    this.value = this.lazy ? undefined : this.get();
  }

  get() {
    let value;
    pushTarget(this);
    value = this.getter.call(this.instance, this.instance);
    popTarget();
    return value;
  }

  addDep(dep) {
    if (!this.depsIds.has(dep.id)) {
      this.depsIds.add(dep.id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }

  // 实际的触发更新（执行expOrFn），由schduler调用
  run() {
    const value = this.get();
    const oldValue = this.value;

    // 设置当前value
    this.value = value;

    // 执行$watch/watch配置的 handler
    this.cb.call(this.instance, value, oldValue);
  }

  /**
   * 这里的调度主要在schduler中实现：大致思路就是：缓存要调用watcher，进而统一处理
   * 目的是让多次状态修改操作合并为一次，调用run触发视图更新
   * 
   * 对于 Computed Watcher ，则只需要修改该watcher的dirty，表示当前 watcher 需要重新计算
   * 因为 update 的调用是由于 Dep触发了notify，后续就是视图更新了（执行渲染函数（执行属性的get）），所以只需要表示该watcher即可
   * getter的执行在 state.js -> createComputedGetter
   */
  update() {
    if (this.lazy) { //如果是 Computed Watcher
      this.dirty = true;
    } else {
      queueWatcher(this);
    }
  }

  /**
   * 将当前watcher 从所有依赖(Dep)中删除
   */
  teardown() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
  }

  /**
   * 重新执行 expOrFn
   * 这个只会由 Computed Watcher 调用
   */
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }

  /**
   * 让当前 Watcher 相关的 Dep 收集 Dep.target
   * 这里只有由Computed Watcher调用，使其具有让相关依赖收集 Render Watcher 的能力
   */
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
}