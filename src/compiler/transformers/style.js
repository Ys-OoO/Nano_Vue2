import { getAndRemoveAttr } from "../helper.js";

/**
 * 处理AST节点中attrs中的style
 * @param {ASTElement} element 
 */
function transformNode(element) {
    const style = getAndRemoveAttr(element, 'style');
    if (style) {
        element.style = JSON.stringify(parseStyleText(style));
    }
}

export function genData(element) {
    let data = '';
    if (element.style) {
        data += `style:${element.style},`;
    }
    return data;
}

export const parseStyleText = function (cssText) {
    const res = {}
    const listDelimiter = /;(?![^(]*\))/g
    const propertyDelimiter = /:(.+)/
    cssText.split(listDelimiter).forEach(function (item) {
        if (item) {
            const tmp = item.split(propertyDelimiter)
            tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim())
        }
    })
    return res
}


export default { transformNode, genData };
