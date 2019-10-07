import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// 在index.js中引入全局样式
import 'antd-mobile/dist/antd-mobile.css';
import './index.css';
import './assets/fonts/iconfont.css';


// 渲染根组件
ReactDOM.render(<App/>, document.getElementById("root"))
