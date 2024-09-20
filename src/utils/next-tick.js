
const callbacks = [];
let pending = false;

const p = Promise.resolve();

/**
 * 向微任务队列中推入异步任务flushCallbacks，使其在同步代码执行后高优先级执行
 */
function timerFunc(){
  p.then(flushCallbacks);
}
/**
 * 执行回调并重置状态
 */
function flushCallbacks(){
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

export function nextTick(cb,ctx){
  let _resolve;

  callbacks.push(()=>{
    if(cb){
      try{
        cb.call(ctx);
      }catch(e){
        console.error(e,ctx,'nextTick');
      }
    }
  });
  
  if(!pending){
    pending = true;
    timerFunc();
  }
}