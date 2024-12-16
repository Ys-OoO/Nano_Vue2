import { createRenderer } from "../src/server-render/index.js";
import NanoVue from "./../src/index.js";

function print(info) {
    console.log("\x1B[36m%s\x1B[0m", info);
}

const app = new NanoVue({
    template: '<div id="foo" bar="123">{{count}}</div>',
    data() {
        return {
            count: 1,
        };
    },
});
const render = createRenderer();
render.renderToString(app, (e, res) => {
    if (e) {
        console.error(e);
    }
    print("--------");
    print(res);
});
