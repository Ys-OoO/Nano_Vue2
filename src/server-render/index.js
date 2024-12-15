import { createRenderFunction } from "./render.js";

// 提供服务端(Node)功能：renderToString(instance->html String)
process.env.VUE_ENV = "server";

/**
 * @param {*} write
 * @param {*} onError
 */
function createWriteFunction(write, onError) {
    const writeFn = (text, next) => {
        const waitForNext = write(text, next);
        if (waitForNext !== true) {
            try {
                next();
            } catch (e) {
                onError(e);
            }
        }
    };
    return writeFn;
}

export function createRenderer() {
    //
    const render = createRenderFunction();
    //   const templateRenderer = new TemplateRenderer({});

    return {
        /**
         *
         * @param {*} component 组件实例
         * @param {*} userContext  用户传入的上下文
         * @param {*} cb (err,res)=>void
         */
        renderToString(component, userContext, cb) {
            if (typeof userContext === "function") {
                cb = userContext;
                userContext = {};
            }

            let result = "";
            const write = createWriteFunction((text) => {
                result += text;
                return false;
            }, cb);

            try {
                render(component, write, userContext, (err) => {
                    if (err) {
                        return cb(err);
                    }

                    return cb(null, result);
                });
            } catch (e) {
                cb(e);
            }
        },
    };
}
