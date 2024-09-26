import { addAttr, addHandler } from "./helper.js";
import transformers from "./transformers/index.js";
// 源码中使用正则表达式来解析模板，在Vue3中则会使用状态机来进行：
// 模板字符串 --词法分析--> tokens --语法分析--> AST
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名 
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //  用来获取标签名
// 👆e.g. let r = "<tagNameX></tagNameX>".match(new Regex(qnameCapture)); // 则 r[1]为标签名"tagNameX"
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签的开始 : <tagNameX> ---> ['<tagNameX','tagNameX',...]
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配闭合标签的 : </tagNameX>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性key和value： a=b  a="b"  a='b' => ['a' ,"b"]
const startTagClose = /^\s*(\/?)>/; // 匹配标签的关闭: > 或 />
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配插值语法内表达式：{{aaaaa}}

// Build Tree Start
let root = null; // 树根
let stack = []; // 利用栈来构造AST
function createAstText(text) {
  return {
    type: 3,
    text,
  }
}
function createAstElement(tagName, attrsList) {
  return {
    tag: tagName,
    type: 1,
    children: [],
    parent: null,
    attrsList
  }
}
function start(tagName, attrsList) { // 构造AST树：处理开始标签
  const astElement = createAstElement(tagName, attrsList);
  if (!root) {
    root = astElement;
  }
  stack.push(astElement);
}
function chars(text) { // 构造AST树：处理内容
  text = text.replace(/\s+/g, "");
  let parent = stack[stack.length - 1];
  if (text) {
    parent.children.push(createAstText(text));
    parent.children[parent.children.length - 1].parent = parent;
  }
}
function end(tagName) { // 构造AST树：处理结束标签
  const curNode = stack.pop();
  if (curNode.tag !== tagName) {
    throw new Error(`unexpected tag : ${tagName} in template.`);
  }
  if (stack.length) { //非根节点，设置正确的parent
    let parent = stack[stack.length - 1];
    parent.children.push(curNode);
    curNode.parent = parent;
  }

  closeElement(curNode);
  return;
}
// Build Tree End

/**
 * 将模板解析为 AST
 * e.g. 
 * <div id='app' v-on:click="handleClick">nano_Vue</div> 
 *    ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
 * {
 *  tag: 'div',
 *  attrsList: [{name:'id',value:'app'}],
 *  attrs:[{name:'id',value:'app'}],
 *  event:{
 *    click:{
 *      
 *    }
 *  }
 *  type: 1,
 *  parent: null,
 *  children: [
 *      {
 *        type: 3,
 *        text: 'nano_Vue',
 *        parent: {tag:'div',....}
 *      } 
 *    ]
 * }
 * @param {string} template 模板
 * @returns AST 
 */
export function parseTemplate(template) {
  root = null;
  stack = [];
  /**
   * 每解析完一段模板，就将其删除/或者说向前移动指针
   * @param {number} len  
   */
  function advance(len) {
    template = template.substring(len);
  }
  /**
   * 解析的目标为标签的开始，即 <div id='app'>{{123}}</div> 中的 <div id='app'>
   */
  function parseStratTag() {
    const startMatch = template.match(startTagOpen);
    if (startMatch) {
      const matched = {
        tagName: startMatch[1],
        attrsList: []
      }
      // 截取当前template: <div id='app'>{{123}}</div> ----> id='app'>{{123}}</div>
      advance(startMatch[0].length);

      // 获取属性
      let endMatch;
      let attrMatch;
      while (true) {
        endMatch = template.match(startTagClose);
        attrMatch = template.match(attribute);
        if (endMatch || !attrMatch) { // 如果是结尾 或 没有匹配到属性就结束
          advance(endMatch[0].length); // 删除结尾
          return matched;
        }

        // 此时已经匹配到属性了
        // 保存属性
        matched.attrsList.push({
          name: attrMatch[1],
          value: attrMatch[3] || attrMatch[4] || attrMatch[5]
        })
        // 截取template中的该属性
        advance(attrMatch[0].length);
      }
      return matched;
    }
    return false;
  }

  while (template) {
    let lessIndex = template.indexOf('<'); // 符号'<'的索引
    if (lessIndex === 0) { // 则当前template为开始或结束tag: <div.... 或 </div...
      // 匹配开始标签
      const startTagMatch = parseStratTag(template);
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrsList);
        continue;
      }
      // 匹配结束标签
      const endTagMatch = template.match(endTag);
      if (endTagMatch) {
        end(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue;
      }
    } else {
      // 匹配内容
      let innerContent = template.substring(0, lessIndex);
      if (innerContent) {
        chars(innerContent);
        advance(lessIndex);
      }
    }
  }

  return root;
}

/**
 * 标签关闭时调用
 * @param {ASTElement} element 
 */
function closeElement(element) {
  processElement(element);
}

/**
 * 处理AST Node
 */
function processElement(element) {
  // 将attrs中的class、style等提取出来
  transformers.forEach(transformer => {
    element = transformer.transformNode(element) || element;
  });

  processAttrs(element);
}

const dirRE = /^v-|^@|^:|^#/
const onRE = /^@|^v-on:/
/**
 * 处理 标签的 Attrs
 */
function processAttrs(element) {
  const list = element.attrsList;
  list.forEach(attr => {
    let name = attr.name;
    let value = attr.value;
    if (dirRE.test(name)) {

      // 处理 v-on
      if (onRE.test(name)) {
        name = name.replace(onRE, '');
        addHandler(element, name, value);
      }
    } else {
      // 其他attrs id/class...
      // 实际上会将 style/class等更细粒度区分
      addAttr(element, name, value);
    }
  });
}