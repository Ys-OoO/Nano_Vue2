import babel from 'rollup-plugin-babel'
export default {
    input:'./src/index.js',
    output:{
        format:'umd', // 支持amd 和 commonjs规范
        name:'NanoVue', // 入口文件导出的数据最终会以[name]挂载在全局对象（浏览器中即window）
        file:'dist/nano_vue.js', //输出
        sourcemap:true, // 打包结果的es5 --映射--> 源码
    },
    plugins:[
        babel({ // 使用babel进行转化 排除node_modules 文件
            exclude:'node_modules/**', 
        })
    ]
}