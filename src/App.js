import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Home from "./pages/Home";
import CityList from "./pages/CityList";
import Map from "./pages/Map";
import Details from "./pages/Details"
import Login from "./pages/Login"
// 发布房源
import Rent from "./pages/Rent"
import RentAdd from "./pages/Rent/Add"
import RentSearch from "./pages/Rent/Search"

// 导入鉴权路由组件
import AuthRoute from "./components/AuthRoute"

// const RentAdd = props => {
//   console.log("props", props)
//   return <h1>页面需要登录</h1>
// }

// 创建App组件
const App = () => {
  return (
    <Router>
      <div className="app">
        {/* 问题: 当直接输入localhost:3000时页面为空, 需要让其访问home页面 */}
        {/* 解决: 重定向 render属性的值是一个函数, 通过``返回值``,指定要``渲染的内容`` */}
        {/* 当页面访问为localhost:3000时 ,重定向到home */}
        {/* 一定要精确匹配, 不然输什么都会到home */}
        <Route exact path="/" render={() => <Redirect to="/home" />} />

        {/* 外层路由 */}
        <Route path="/home" component={Home} />
        <Route path="/citylist" component={CityList} />
        <Route path="/map" component={Map} />
        <Route path="/detail/:id" component={Details} />
        <Route path="/login" component={Login} />

        {/* 配置需要登录后才能访问的页面 */}
        <AuthRoute exact path="/rent" component={Rent}/>
        <AuthRoute path="/rent/add" component={RentAdd}/>
        <AuthRoute path="/rent/search" component={RentSearch}/>

      </div>
    </Router>
  );
};

// 导出App
export default App;
