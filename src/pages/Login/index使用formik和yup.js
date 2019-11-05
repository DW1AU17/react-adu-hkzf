import React, { Component } from "react";
import { Flex, WingBlank, WhiteSpace, Toast } from "antd-mobile";

import { Link } from "react-router-dom";

import NavHeader from "../../components/NavHeader";

// 导入 formik 组件处理表单提交
import { withFormik } from 'formik'
// 导入 表单验证 yup
import * as Yup from 'yup'    // 引入全部 或者 部分 

import styles from "./index.module.css";
import { API, setToken } from "../../utils";

// 验证规则：
const REG_UNAME = /^[a-zA-Z_\d]{5,8}$/
const REG_PWD = /^[a-zA-Z_\d]{5,12}$/

class Login extends Component {
  render() {
    // 接受高阶组件通过props 传递的 value值 和 事件处理方法
    const { 
      values, 
      handleSubmit, 
      handleChange,
      handleBlur,
      errors,
      touched
    } = this.props
    // errors 表示：错误消息 
    // touched 表示：当前表单项是否被访问过，只要访问过，那么，当前值为 true
    // 注意： touched属性必须经过 handleBlur 处理过失焦点事件后，才会生效
    // console.log('表单校验：', errors, touched)
    return (
      <div className={styles.root}>
        {/* 顶部导航 */}
        <NavHeader className={styles.navHeader}>账号登录</NavHeader>
        <WhiteSpace size="xl" />

        {/* 登录表单 */}
        <WingBlank>
          <form onSubmit={handleSubmit}>
            <div className={styles.formItem}>
              <input
                className={styles.input}
                name="username"
                placeholder="请输入账号"
                value={values.username}
                // 使用高阶组件, 默认把给成handleChange
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off"
              />
            </div>
            {/* 错误时, 提示验证信息 */}
            {touched.username && errors.username && (
              <div className={styles.error}>{errors.username}</div>
            )}
            <div className={styles.formItem}>
              <input
                className={styles.input}
                name="password"
                type="password"
                placeholder="请输入密码"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.password && errors.password && (
              <div className={styles.error}>{errors.password}</div>
            )}
            <div className={styles.formSubmit}>
              <button className={styles.submit} type="submit">
                登 录
              </button>
            </div>
          </form>
          <Flex className={styles.backHome}>
            <Flex.Item>
              <Link to="/registe">还没有账号，去注册~</Link>
            </Flex.Item>
          </Flex>
        </WingBlank>
      </div>
    );
  }
}

// 使用 withFormik 高阶组件包装 Login 组件
// 两次调用(第一次: 传入一些配置对象)( 第二次: 包装组件)
Login = withFormik({
  // 为表单提供状态值, 相当于Login组件中的 state 状态
  mapPropsToValues: () => ({username: 'test2', password: 'test2'}),

  // 表单校验规则:
  validationSchema: Yup.object().shape({
    // 验证username (不满足条件时展示错误消息提示)  使用和PropTypes差不多性质
    username: Yup.string()
      .required('账号必填项')
      .matches(REG_UNAME, '长度为5到8位，只能出现数字、字母、下划线'),   // (正则, 提示\组件中通过errors.username获取\)
    password: Yup.string()
      .required('账号必填项')
      .matches(REG_PWD, '长度为5到8位，只能出现数字、字母、下划线')
  }),

  // 为飙到提供时间处理函数
  // props 表示传递给被包装组件(Login)的属性, 如: 路由信息
  handleSubmit: async (values, { props }) => {
    const { username, password } = values;

    const res = await API.post("/user/login", { username, password });

    // 登录成功, 把token存到本地
    const { status, description } = res.data;
    if (status === 200) {
      const {
        body: { token }
      } = res.data;
      // 登录成功( 存token, 返回登录之前的页面 )
      setToken(token);
      props.history.go(-1);
    } else {
      Toast.info(description, 2, null, false);
    }
  }
})(Login)

// 导出高阶组件包装后的组件
export default Login;
