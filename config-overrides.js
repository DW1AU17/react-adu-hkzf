// config-overrides.js（用于覆盖脚手架默认配置）
// 用于按需加载组件代码和样式, 安装 yarn add babel-plugin-import 插件
// 就不需要在index.js中引入全局 antd-mobile 样式文件了
const { override, fixBabelImports } = require('customize-cra');

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd-mobile',
    style: 'css',
  }),
);