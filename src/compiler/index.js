import { generate } from './generate.js';
import { parseTemplate } from "./parse.js";

/**
 * 将 模板字符串 转换为 渲染函数
 * @param {string} template 模板字符串
 */
export function compileToFunctions(template) {
  // 1. template ---> AST
  const astRoot = parseTemplate(template.trim());
  // 2. AST ---> render
  const code = generate(astRoot);
  // 这里的 code 是用 with()包裹的，所需参数是this，也就是Vue实例
  return new Function(code.render);
}