import React from "react";

import { Route, Redirect } from "react-router-dom";

import { isAuth } from "../../utils";

// 控制需要登录才能访问的页面
// 封装一个高阶组件

// 1. 在 AuthRoute 组件中返回 Route 组件(在Route基础上做了包装)
// 2. 调用isAuth 判断是否登录
// 3. 登录了: 渲染当前组件 (通过component获取到要渲染的组件)
// 4. 没有登录: 重定向到登录页面, 并制定成功后要跳转的页面路径
// 5. AuthRoute 组件接受到的 props 原样传递给 Route 组件 (确保使用方式还是和Route一样)
// 6. 使用 AuthRoute 组件配置路由规则, 验证能否实现页面的登录访问控制

// 接受到 Route 传递的组件, 重命名为 组件名(首字母大写) / 组件传递的别的参数 rest 
const AuthRoute = ({ component: Component, ...rest }) => {
  return (
    // render-prop模式
    <Route 
      {...rest} 
      render = {props => {
        // props : 当前路由信息
        if (isAuth()) {
          // 登录了, 就直接渲染组件  / 5. 接受到的props传递给Route
          return <Component {...props} />;
        } else {
          // 没登录, 重定向
          return (
            <Redirect  
              to={{
                pathname: '/login',   // 要跳转的页面
                // 在login页面中的this.props.location.state 中获取
                state: {from: props.location}  // 传递额外数据, 用来指定登录成功后的返回的页面
              }}
            />
          )
        }
      }}
    />
  );
};

export default AuthRoute