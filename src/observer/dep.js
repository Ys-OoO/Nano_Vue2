let id = 0;
export default class Dep{
  static target;
  constructor(){
    this.id = id++;
    this.subs = [];
  }

  addSub(watcher){
    this.subs.push(watcher);
  }

  depend() {
    if(Dep.target){
      Dep.target.addDep(this);
    }
  }

  notify(){
    const subs = this.subs.filter(s=>s);
    for (let i = 0; i < subs.length; i++) {
      const sub = subs[i];
      sub.update();
    }
  }

  removeSub(sub){
    this.subs[this.subs.indexOf(sub)] = null;
  }
}

Dep.target = null; // 最新的观察者（全局静态属性，唯一）
const targetStack = []; // 全局观察者

// pushTarget 和 popTarget 是为了确保取值操作来自渲染函数的调用，
// 如果再模板之外取值，此时无对应的Watcher，因此可以在defineProperty.get中控制依赖收集

// 增加 Watcher
export function pushTarget(watcher){
  targetStack.push(watcher);
  Dep.target = watcher;
}

// 删除 Watcher
export function popTarget(){
  targetStack.pop();
  Dep.target = targetStack[targetStack.length-1];
}