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

However, HTML templates are not supported. In addition, I directly used the CSR compiler, many directives were not compatible, and a large part of the magic was modified. In Vue SSR, there is actually a similar compiler to be compatible with the server-side scenario.

## Client Side

The next step will be to simply implement hydrate!

# Contact me

-   WeChat：ys5-14
-   Email: ys0514@yeah.net
