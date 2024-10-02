/**
 * * modules文件夹对应源码中的 `platform/web/runtime/modules`
 * * 这里所提供的均是不同平台运行时API的封装，例如DOM操作等。由于NanoVue只适用于Web，因此不做过细区分
 */

import { updateAttrs } from "./attrs.js";
import events from "./events.js";


export default {
    updateAttrs,
    updateEvents: events.update,
    destoryEvents: events.destory
}