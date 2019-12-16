import React from "react";
import ReactDOM from "react-dom";

// 在index.js中引入全局样式
// import 'antd-mobile/dist/antd-mobile.css';
// 字体样式
import './assets/fonts/iconfont.css';
// react-virtualized 样式
import 'react-virtualized/styles.css'

// 根组件(丢最后)
import App from "./App";

// 全局样式 (样式有覆盖问题，放App后)
import './index.css';

// 渲染根组件
ReactDOM.render(<App/>, document.getElementById("root"))
