import { isDef, isObject, isUndef } from "../utils/index.js";
import { ssrCompileToFunctions } from "./../compiler/server-compile.js";
import { RenderContext } from "./render-context.js";

const SSR_ATTR = "data-server-rendered";

/**
 *实例在创建时的tempalte转化为渲染函数
 * @param {*} vm 当前NanoVue实例
 */
function normalizeRender(vm) {
    const { render, template } = vm.$options;
    if (!render) {
        if (template) {
            // ssrCompileToFunctions (实际上就是CSR编译那一套,将html->renderFunction（_c('div', ...)
            const compiled = ssrCompileToFunctions(template);
            vm.$options.render = function () {
                const renderVnodes = new Function(compiled.render);
                const vnodes = renderVnodes.call(this);
                return vnodes;
            };
        } else {
            console.error("Server render need a template to convert");
        }
    } else {
        console.error("Not support render function in NanoVue");
    }
}

/**
 * 渲染字符串节点
 * @param {*} el vnode
 * @param {*} context
 */
function renderStringNode(el, context) {
    const { write, next } = context;
    if (isUndef(el.children) || el.children.length === 0) {
        // 空子节点
        // 源码这里是el.open +... ，这是由于构造的StringNode这样构造的，而这里借用VNode，因此直接使用text
        write(el.text + (el.close || ""), next);
    }
}

// todo
function renderComponent(node, isRoot, context) {}

/**
 * 将普通HTML标签写入
 * @param {*} el vnode
 * @param {*} isRoot 是否根节点
 * @param {*} context 渲染上下文
 */
function renderElement(el, isRoot, context) {
    const { write, next } = context;
    if (isRoot) {
        // 根节点--嵌入服务端渲染标识
        if (!el.data) el.data = {};
        if (!el.data.attrs) el.data.attrs = {};
        el.data.attrs[SSR_ATTR] = "true";
    }

    const startTag = renderStartingTag(el, context);
    const endTag = `</${el.tag}>`;
    // 不考虑一元标签(unary tag)
    // 无子节点，直接write
    if (isUndef(el.children) || el.children.length === 0) {
        write(startTag + endTag);
    } else {
        // 有子节点，进一步处理
        const children = el.children;
        // 子节点的处理方式是：保存“拥有子节点的状态”
        context.renderStates.push({
            type: "Element",
            children,
            rendered: 0,
            total: children.length,
            endTag,
        });
        write(startTag, next);
    }
}

/**
 *
 * @param {*} node vnode
 * @param {*} isRoot 是否根节点
 * @param {*} context renderContext 渲染上下文
 */
function renderNode(node, isRoot, context) {
    if (node.isString) {
        renderStringNode(node, context);
    } else if (isDef(node.componentOptions)) {
        renderComponent(node, isRoot, context);
    } else if (isDef(node.tag)) {
        renderElement(node, isRoot, context);
    } else {
        console.warn("only process Component, HTML Element");
    }
}

export function createRenderFunction() {
    return function render(component, write, userContext, doneCallback) {
        if (isObject(userContext) && Object.keys(userContext).length) {
            console.warn("now we not support userContext!");
        }

        const context = new RenderContext({
            activeInstance: component,
            write,
            renderNode,
        });
        // 将组件的template转为渲染函数
        normalizeRender(component);
        // 生成vnodes
        const vnodes = component._render();

        renderNode(vnodes, true, context);
        doneCallback();
    };
}

function hasAncestorData(node) {
    const parentNode = node.parent;
    return (
        isDef(parentNode) &&
        (isDef(parentNode.data) || hasAncestorData(parentNode))
    );
}

function renderStartingTag(node, context) {
    let markup = `<${node.tag} `;

    // todo directives

    if (isUndef(node.data) && hasAncestorData(node)) {
        node.data = {};
    }

    if (isDef(node.data)) {
        // 当前节点有data 也就是有attrs directives等
        // 这里目前只处理attrs, 处理方式比较暴力，直接字符串拼接了
        const attrs = node.data.attrs;
        for (let attr in attrs) {
            markup += `${attr}=${attrs[attr]} `;
        }
    }

    return markup + ">";
}
