
/**
 * 执行后el上将新增类似下述的events属性
        events: {
            click: [ //多个事件
                { 
                    value: 'handleClick',
                },
                {
                    value: 'handleAnotherClick',
                }
            ]
        }
        或
        events: {
            click: { //一个事件
                value: 'handleClick',
            }
        }
 */
export function addHandler(el, name, value) {
    let events = el.events || (el.events = {});

    const handlers = events[name];
    const newHandler = {
        value,
    }

    if (Array.isArray(handlers)) {
        handlers.push(newHandler);
    } else {
        events[name] = handlers ? [handlers, newHandler] : newHandler;
    }
}

export function addAttr(el, name, value) {
    const attrs = el.attrs || (el.attrs = []);
    attrs.push({ name, value });
}