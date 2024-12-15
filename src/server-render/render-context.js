import { isUndef } from "./../utils/index";

export class RenderContext {
    activeInstance;
    write;
    done;

    renderStates;
    renderNode;

    constructor(options) {
        this.activeInstance = options.activeInstance;
        this.write = options.write;
        this.modules = options.modules;
        this.renderNode = options.renderNode;
        this.done = options.done;

        this.renderStates = [];
        this.next = this.next.bind(this);
    }

    /**
     * next 将处理子节点
     */
    next() {
        while (true) {
            const lastState = this.renderStates[this.renderStates.length - 1];

            // 无状态
            if (isUndef(lastState)) {
                // return this.done();
                return;
            }

            switch (lastState.type) {
                case "Element":
                case "Fragement":
                    const { children, total } = lastState;
                    const rendered = lastState.rendered;
                    lastState.rendered++;
                    if (rendered < total) {
                        return this.renderNode(children[rendered], false, this);
                    } else {
                        this.renderStates.pop();
                        if (lastState.type === "Element") {
                            return this.write(lastState.endTag, this.next);
                        }
                    }
                    break;
                case "Component":
                    this.renderStates.pop();
                    this.activeInstance = lastState.prevActive;
                    break;
            }
        }
    }
}
