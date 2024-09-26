import { getAndRemoveAttr } from "../helper.js";

/**
 * 处理AST节点中attrs中的class
 * @param {ASTElement} element 
 */
function transformNode(element) {
    const clazz = getAndRemoveAttr(element, 'class');
    if (clazz) {
        element.class = JSON.stringify(clazz.replace(/\s+/g, ' ').trim())
    }
}

export function genData(element) {
    let data = '';
    if (element.class) {
        data += `class:${element.class},`;
    }
    return data;
}
export default { transformNode, genData };