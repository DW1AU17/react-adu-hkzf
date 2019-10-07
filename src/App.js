import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Home from "./pages/Home";
import CityList from "./pages/CityList";
import Map from "./pages/Map";

// 创建App组件
const App = () => {
  return (
    <Router>
      <div className="app">
        {/* 问题: 当直接输入localhost:3000时页面为空, 需要让其访问home页面 */}
        {/* 解决: 重定向 render属性的值是一个函数, 通过``返回值``,指定要``渲染的内容`` */}
        {/* 当页面访问为localhost:3000时 ,重定向到home */}
        <Route path="/" render={() => <Redirect to="/home" />} />

        {/* 外层路由 */}
        <Route path="/home" component={Home} />
        <Route path="/citylist" component={CityList} />
        <Route path="/map" component={Map} />
      </div>
    </Router>
  );
};

// 导出App
export default App;
