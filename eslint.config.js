export default [
  {
    // 指定代码运行的环境
    "env": {
      "browser": true,  // 允许使用浏览器环境中的全局变量，如 window 和 document
      "es2021": true  // 支持 ECMAScript 2021 的语法
    },
    // 解析器选项，定义如何解析不同的 ECMAScript 版本和模块
    "parserOptions": {
      "ecmaVersion": 12,  // 指定 ECMAScript 版本为 12（ES2021）
      "parser": "@typescript-eslint/parser",  // 使用 @typescript-eslint/parser 解析 TypeScript 代码
      "sourceType": "module"  // 指定使用 ES 模块的模块系统
    },
    // 自定义的规则配置（当前为空，但可以添加自定义规则）
    "rules": {
      "semi": ["error", "always"] // 强制要求语句以分号结束
    }
  }
]
