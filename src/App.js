// React.lazy采用必须调用动态函数的函数import()
// 按需加载, Suspense包裹用来在动态组件加载完成之前，显示一些 loading 内容，需要包裹动态组件内容
import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Home from "./pages/Home";
 
const CityList = lazy(() => import( "./pages/CityList"))
const Map = lazy(() => import( "./pages/Map"))
const Details = lazy(() => import( "./pages/Details"))
const Login = lazy(() => import( "./pages/Login"))
// 发布房源
const Rent = lazy(() => import( "./pages/Rent"))
const RentAdd = lazy(() => import( "./pages/Rent/Add"))
const RentSearch = lazy(() => import( "./pages/Rent/Search"))
// 导入鉴权路由组件
const AuthRoute = lazy(() => import("./components/AuthRoute"))

// const RentAdd = props => {
//   console.log("props", props)
//   return <h1>页面需要登录</h1>
// }

// 创建App组件
const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
    </Suspense>
  );
};

// 导出App
export default App;
