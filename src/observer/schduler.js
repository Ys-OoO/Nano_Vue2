import { nextTick } from "../utils/next-tick.js";

let queue = [];

let has = {}; // 存放所有watcher，用于去重判断

let waiting = false;

function flushSchdulerQueue() {
  for (let i = 0; i < queue.length; i++) {
    const watcher = queue[i];
    const id = watcher.id;
    has[id] = null;
    watcher.run();
  }
  queue = [];
  waiting = false;
}

/**
 * 缓存Watcher, 执行一次视图更新
 * 原理：
 *  同时触发多次状态修改，会产生多次更新（见observer/index）,但是属于同一个Watcher
 *    会先根据id去重，避免多次触发
 *    对于多次更新的防抖，是借助微任务和事件循环机制共同实现的
 * @param {Watcher} watcher 
 */
export function queueWatcher(watcher) {
  const id = watcher.id;
  // !去重 保证更新前queue中Watcher不一样
  if (has[id]) {
    return;
  }

  has[id] = true;
  queue.push(watcher);

  if (!waiting) {
    waiting = true;

    // !异步控制 保证多次 queueWatcher() 的执行只有一次生效
    nextTick(flushSchdulerQueue);
  }
}