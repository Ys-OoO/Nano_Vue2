import transformers from "./transformers/index.js";

/**
 * 将AST树转换为 render 函数
 * e.g.
 *  {
 *  tag: 'div',
 *  attrs: [{name:'id',value:'app'}],
 *  type: 1,
 *  parent: null,
 *  children: [
 *      {
 *        type: 3,
 *        text: 'nano_Vue {{version}}',
 *        parent: {tag:'div',....}
 *      }
 *    ]
 * }
 * ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
 * with(this){
 * 		return _c('div',data:{id:'app'},[_v("nano_Vue"+_s(version))])
 * }
 *
 * 遍历 AST 树，拼接为渲染函数string
 * https://github.com/vuejs/vue/blob/73486cb5f5862a443b42c2aff68b82320218cbcd/src/compiler/codegen/index.ts#L57
 * @param {AST} astRoot 模板对应的AST树
 * @return {
 *  render: renderString,
 * }
 */
export function generate(astRoot) {
  const code = astRoot
    ? astRoot.tag === "script"
      ? null
      : genElement(astRoot)
    : '_c("div")';

  console.log(code);
  return {
    render: `with(this){return ${code}}`,
  };
}

/**
 * 根据AST节点生成渲染函数
 * 对于组件或普通元素,生成创建VNode的代码
 * @param {AST} el
 * @returns
 */
function genElement(el) {
  // 后续完善对于 v-onec/v-if/v-slot/component等的代码生成

  if (el.for && !el.forProcessed) {
    return genFor(el);
  } else {
    // element
    let code;
    let data = genData(el);
    let children = genChildren(el);

    code = `_c('${el.tag}'${
      data ? `,${data}` : "" // data
    }${
      children ? `,${children}` : "" //children
    })`;

    return code;
  }
}

/**
 * 为 AST 中的v-for生成对应的渲染函数
 * 处理完成后会再次调用genElement处理其他数据
 * e.g.
 * {
 *     for: "list",
 *     alias: "item",
 *     iterator1: "name",
 *     iterator2: "index"
 * }
 * ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
 * _l((list),function(item,name,index){
 *    return _c(...) // 渲染函数
 * })
 * @param {*} el
 */
function genFor(el) {
  const exp = el.for; // 遍历对象
  const alias = el.alias; // 单项别名
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : "";
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : "";

  el.forProcessed = true; // 标识for已经处理过了

  const code =
    `_l((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
    `return ${genElement(el)}` + // 内部调用genElement处理其他数据
    "})";

  return code;
}

/**
 * 为对应的AST生成data
 * 包括：key,ref,attrs,event等等
 * @param {AST} el
 */
function genData(el) {
  //目前只处理attrs
  let data = "{";

  // key
  if (el.key) {
    data += `key:${el.key},`;
  }

  // class/style
  transformers.forEach((transformers) => {
    data += transformers.genData(el);
  });

  if (el.attrs) {
    // attrs
    data += `attrs:${genProps(el.attrs)},`;
  }

  if (el.events) {
    // events
    data += `${genHandlers(el.events)},`;
  }
  data = data.replace(/,$/, "") + "}";
  return data;
}

function genProps(props) {
  let ret = ``;
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const value = transformSpecialNewlines(prop.value);

    ret += `${prop.name}:${JSON.stringify(value)},`;
  }
  ret = `{${ret.slice(0, -1)}}`;
  return ret;
}

function genHandlers(events) {
  function genHandler(handler) {
    if (Array.isArray(handler)) {
      return `[${handler.map((h) => genHandler(h)).join(",")}]`;
    }

    // 如果是路径（obj.func）或函数表达式 --- 未处理

    return `function($event){${handler.value}}`;
  }

  let handlers = ``;
  for (const name in events) {
    const handlerCode = genHandler(events[name]);
    handlers += `"${name}":${handlerCode}`;
  }
  handlers = `{${handlers}}`;
  return "on:" + handlers;
}

function genNode(node) {
  if (node.type === 1) {
    return genElement(node);
  } else if (node.type === 3) {
    return genText(node);
  }
}

function genChildren(el) {
  const children = el.children;
  const gen = genNode;
  return `[${children.map((c) => gen(c)).join(",")}]`;
}

/**
 * 目的是将字符串内容进行转换，其中可能包含{{}}
 * e.g.
 * welcome to {{pos}} {{time}}
 * ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
 * 'welcome to' + _s(pos) + _s(time)
 * @param {Text AST Node} textNode
 * @returns
 */
function genText(textNode) {
  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  let hasVaribale = defaultTagRE.test(textNode.text); // 是否有{{}}
  let tokens = [];
  if (hasVaribale) {
    let match;
    let lastIndex = (defaultTagRE.lastIndex = 0); // 上次匹配到 '{{' 的索引

    while ((match = defaultTagRE.exec(textNode.text))) {
      let index = match.index;

      if (index > lastIndex) {
        //普通字符串
        tokens.push(JSON.stringify(textNode.text.slice(lastIndex, index)));
      }

      tokens.push(`_s(${match[1].trim()})`);
      lastIndex = index + match[0].length;
    }

    // 收集剩余普通字符串
    if (lastIndex < textNode.text.length) {
      tokens.push(JSON.stringify(textNode.text.slice(lastIndex)));
    }
  }

  return `_v(${
    hasVaribale
      ? tokens.join("+")
      : transformSpecialNewlines(JSON.stringify(textNode.text))
  })`;
}

// 转义行分隔符\u2028 和 段落分隔符\u2029
function transformSpecialNewlines(text) {
  return text.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
