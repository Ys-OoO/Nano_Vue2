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

// ------------case 2: 两者的 tag 发生了变化
let oldTemplate2 = `<div class="a" style="color:red;border:1px solid black;" a="1">Hello</div>`;
let newTemplate2 = `<div class="b" b="2">NanoVue</div>`;
diff(oldTemplate2, newTemplate2);


function diff(oldTemp, newTemp) {
    let oldRender = compileToFunctions(oldTemp);
    let newRender = compileToFunctions(newTemp);
    // 渲染函数

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
