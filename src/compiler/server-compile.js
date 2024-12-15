import { generate } from "./generate.js";
import { parseTemplate } from "./parse.js";

/**
 * 将 模板字符串 转换为 渲染函数
 * @param {string} template 模板字符串
 */
export function ssrCompileToFunctions(template) {
    // 1. template ---> AST
    const ast = parseTemplate(template.trim());

    // 2. AST ---> render
    const code = generate(ast);
    return {
        ast,
        render: code.render,
    };
}
