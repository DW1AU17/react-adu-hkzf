import React from "react";
// 引入 antd 中的 NavBar 样式
import { NavBar } from "antd-mobile";
// 导入 withRouter 高阶组件
import { withRouter } from "react-router-dom";
// 导入属性校验   PropTypes
// import PropTypes from "prop-types";

// import "./index.scss";
// 使用css modules
import styles from "./index.module.scss";

// 接受props为形参
// 不能直接获取 props 中的history , 因为该组件不是直接通过 Router包裹的
// 通过高阶组件 withRouter 获取
function NavHeader({children, history}) {
  return (
    <NavBar
      className={styles.navbar}
      mode="light"
      icon={<i className="iconfont icon-back" />}
      onLeftClick={() => history.go(-1)}
    >
      {children}
    </NavBar>
  );
}

// 给组价添加props校验 (验证传入的属性)
// NavHeader.propTypes = {
//   children: PropTypes.string.isRequired   // isRequired: 没有值传入报错
// }

// 直接返回被包裹的组件即可
export default withRouter(NavHeader)
