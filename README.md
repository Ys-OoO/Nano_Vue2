# Nano_Vue2

Nano_Vue2 aims to further understand the inner workings of Vue2

<div align="center"><img width="208" alt="logo" src="https://github.com/user-attachments/assets/164cb909-2b0e-4a42-9f9b-2012fa061ac8"></div>

## Implemented Features

-   global API:
    -   NanoVue.mixin
    -   NanoVue.component
    -   NanoVue.extend
-   options / Data:
    -   data
    -   watch
    -   computed
    -   methods
-   options / DOM:
    -   el
    -   template
    -   render
-   options / Lifecycle Hook:
    -   beforeMount
    -   mounted (only root instance)
-   instance property:
    -   $data
    -   $options
    -   $el
-   instance method / data:
    -   $watch
    -   $set
-   instance method / lifecycle:
    -   instance.$mount
    -   instance.$nextTick
-   directives:
    -   v-for
    -   v-if
    -   v-on

# Initial Flow

```text
HTML String
(👇parse👇)
              Abstract Struct Tree
                (👇generate👇)
                                   Render Function
                                    (👇invoke👇)
                                                   Virtual DOM
                                                   (👇patch👇)
                                                                DOM
```

## Expand

In Vue2, converting HTML to AST uses regular expressions.

In Vue3, this step is implemented by implementing a finite state machine according to the [WhatWG](https://html.spec.whatwg.org/multipage/parsing.html#tokenization) specification. In fact, the bottom layer of regularity can also be understood as a finite state machine.

# Reactive

> Reactive = Observer pattern + [Object.defineProperty](./src/observer/index.js)
>
> Observer pattern = [Watcher(Observer)](./src/observer/watcher.js) + [Dep(observale object)](./src/observer/dep.js)

# SSR

## Server side

The principle of SSR in Vue2 is actually similar to CSR. The similarities are that the template is parsed and lexically analyzed on the server side, and then converted into a rendering function. Then the HTML string is concatenated according to the rendering function.

Currently, the functions that have been implemented are:

```js
const render = createRenderer();
render.renderToString(app, (err, res) => {});
```

However, HTML templates are not supported. In addition, I directly used the CSR compiler, many directives were not compatible, and a large part of the magic was modified. In Vue SSR, there is actually a similar compiler to be compatible with the server-side scenario. Currently, it can only convert HTML tags and strings. Component level is not implemented yet.

## Client Side

Currently, NanoVue2 has implemented some hydration capabilities (only supports simple elements). The core of this part is:

1. When `$mount`, it will obtain whether there is a server-rendered tag on the target mounted DOM: `data-server-rendered='true'`, and hydrate if it exists.
2. During the hydration process, since the client will also execute code similar to `new NanoVue()`, a virtual DOM tree has been generated according to the template. `hydrate` after `$mount` will match the virtual DOM tree with the real DOM tree one by one to determine whether the hydration is successful

Demo:
Server Rendered HTML

```html
<div data-server-rendered="true" id="app"><div id="foo">1</div></div>
```

Client Side Script

```js
const instance = new NanoVue({
    template: `<div id="app"><div id="foo" @click="handleClick">{{count}}</div></div>`,
    data: {
        count: 1,
    },
    methods: {
        handleClick() {
            this.count++;
        },
    },
});
instance.$mount("#app");
```

# Contact me

-   WeChat：ys5-14
-   Email: ys0514@yeah.net
