/**
 * * Diff
 */
import { compileToFunctions } from '../src/compiler/index.js';
import NanoVue from '../src/index.js';
import { patch } from '../src/vdom/patch.js';

// ------------case 1: 两者的 tag 发生了变化
let oldTemplate1 = `<div>Hello</div>`;
let newTemplate1 = `<p>NanoVue</p>`;
// diff(oldTemplate1, newTemplate1);

// ------------case 2: 两者的属性发生了变化
let oldTemplate2 = `<div class="a" style="color:red;border:1px solid black;" a="1">Hello</div>`;
let newTemplate2 = `<div class="b" b="2">NanoVue</div>`;
// diff(oldTemplate2, newTemplate2);

// ------------case 3: 有子节点->无子节点 之间的Diff 
// ^ 这种情况在Vue中不会出现，因为使用v-if=false会创建一个空text节点，但这里仍然兼容
let oldTemplate3 = `<div><div class='old_ch'>OldChildren</div></div>`;
let newTemplate3 = `<div></div>`;
// diff(oldTemplate3, newTemplate3);

// ------------case 4: 无子节点->有子节点 之间的Diff
let oldTemplate4 = `<div></div>`;
let newTemplate4 = `<div><div class='new_ch'>NewChildren</div></div>`;
// diff(oldTemplate4, newTemplate4);

// ~都有子节点
// ------------case 5: 子节点顺序一致，内容有变化
let oldTemplate5 = `<div><h1>1</h1><h2>2</h2><h3>3</h3></div>`;
let newTemplate5 = `<div><h1>1111</h1><h2>2</h2><h3>333</h3></div>`;
// diff(oldTemplate5, newTemplate5);

// ------------case 6: 子节点顺序颠倒
let oldTemplate6 = `<div><h1>1</h1><h2>2</h2><h3>3</h3><h4>4</h4></div>`;
let newTemplate6 = `<div><h4>4</h4><h3>3</h3><h2>2</h2><h1>1</h1></div>`;
// diff(oldTemplate6, newTemplate6);

// --------case 7: 尾节点前移
let oldTemplate7 = `<div><h1>1</h1><h2>2</h2><h3>3</h3></div>`;
let newTemplate7 = `<div><h3>3</h3><h1>1</h1><h2>2</h2></div>`;
// diff(oldTemplate7, newTemplate7);

// --------case 8: 增加节点
let oldTemplate8 = `<div><h1>1</h1></div>`;
let newTemplate8 = `<div><h1>1</h1><h2>2</h2><h3>3</h3></div>`;
// diff(oldTemplate8, newTemplate8);

// --------case 9: 删除节点
let oldTemplate9 = `<div><h1>1</h1><h2>2</h2><h3>3</h3></div>`;
let newTemplate9 = `<div><h1>1</h1><h2>2</h2></div>`;
// diff(oldTemplate9, newTemplate9);

// --------case 10: 乱序
let oldTemplate10 = `<div><h3 key="3">3</h3></div>`;
let newTemplate10 = `<div><h2 key="2">2</h2><h1 key="1">1</h1><h4 key="4">4</h4><h5 key="5">5</h5></div>`;
diff(oldTemplate10, newTemplate10);

function diff(oldTemp, newTemp) {
    // 渲染函数
    let oldRender = compileToFunctions(oldTemp);
    let newRender = compileToFunctions(newTemp);

    console.log(oldRender)
    // 虚拟DOM
    let instance = new NanoVue({});
    const oldVNode = oldRender.call(instance);
    const newVNode = newRender.call(instance);

    // 第一次挂载
    let elm = patch(document.querySelector('#app'), oldVNode);
    document.body.appendChild(elm);

    // 第二次更新
    setTimeout(() => {
        patch(oldVNode, newVNode);
    }, 1000)
}
