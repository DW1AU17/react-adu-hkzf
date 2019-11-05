import React, { Component } from "react";

import { Link } from "react-router-dom";
// Modal有alert属性
import { Grid, Button, Modal } from "antd-mobile";

import { BASE_URL, isAuth, API, removeToken } from "../../utils";

import styles from "./index.module.css";

// 菜单数据
const menus = [
  { id: 1, name: "我的收藏", iconfont: "icon-coll", to: "/favorate" },
  { id: 2, name: "我的出租", iconfont: "icon-ind", to: "/rent" },
  { id: 3, name: "看房记录", iconfont: "icon-record" },
  {
    id: 4,
    name: "成为房主",
    iconfont: "icon-identity"
  },
  { id: 5, name: "个人资料", iconfont: "icon-myinfo" },
  { id: 6, name: "联系我们", iconfont: "icon-cust" }
];

// 默认头像
const DEFAULT_AVATAR = BASE_URL + "/img/profile/avatar.png";

const alert = Modal.alert;

export default class Profile extends Component {
  state = {
    isLogin: isAuth(), // 判断是否登录
    userInfo: {
      avatar: "/img/profile/avatar.png",  // 图片会空白的闪一下, 默认占位用
      nickname: "游客"
    } // 登录信息, 默认游客
  };

  componentDidMount() {
    this.getUserInfo();
  }

  // 获取个人资料
  async getUserInfo() {
    // 没有登录就不用发送了
    if (!this.state.isLogin) return;
    // 发请求, 获取个人资料 (在请求头中携带token)
    const res = await API.get("/user");

    const { status, body } = res.data;
    if (status === 200) {
      // 保存登录信息
      this.setState({
        userInfo: body
      });
    } else {
      // 失败 (因为能拿到token, 所以说明token过期了)
      // 移除token
      removeToken();
      // 重置登录状态, 为未登录状态
      this.setState({
        isLogin: false
      });
    }
  }

  // 退出登录
  // 退出需要服务器退出 和 本地退出
  logout = () => {
    alert("提示", "是否确定退出", [
      { text: "取消" },
      { text: "退出", onPress: async () => {
          // 服务器退出
          await API.post("/user/logout")

          // 本地退出 
          removeToken()

          // 更改登录状态
          this.setState({
            isLogin: false,
            userInfo: {}
          })
      } }
    ]);
  };

  render() {
    const { history } = this.props;
    // 解构state中的数据
    const {
      isLogin,
      userInfo: { avatar, nickname }
    } = this.state;

    return (
      <div className={styles.root}>
        {/* 个人信息 */}
        <div className={styles.title}>
          <img
            className={styles.bg}
            src={BASE_URL + "/img/profile/bg.png"}
            alt="背景图"
          />
          <div className={styles.info}>
            <div className={styles.myIcon}>
              <img
                className={styles.avatar}
                src={isLogin ? BASE_URL + avatar : DEFAULT_AVATAR}
                alt="icon"
              />
            </div>
            <div className={styles.user}>
              <div className={styles.name}>{isLogin ? nickname : "游客"}</div>
              {isLogin ? (
                /* 登录后展示： */
                <>
                  <div className={styles.auth}>
                    <span onClick={this.logout}>退出</span>
                  </div>
                  <div className={styles.edit}>
                    编辑个人资料
                    <span className={styles.arrow}>
                      <i className="iconfont icon-arrow" />
                    </span>
                  </div>
                </>
              ) : (
                /* 未登录展示： */
                <div className={styles.edit}>
                  <Button
                    type="primary"
                    size="small"
                    inline
                    onClick={() => history.push("/login")}
                  >
                    去登录
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 九宫格菜单 */}
        <Grid
          data={menus}
          columnNum={3}
          hasLine={false}
          renderItem={item =>
            item.to ? (
              <Link to={item.to}>
                <div className={styles.menuItem}>
                  <i className={`iconfont ${item.iconfont}`} />
                  <span>{item.name}</span>
                </div>
              </Link>
            ) : (
              <div className={styles.menuItem}>
                <i className={`iconfont ${item.iconfont}`} />
                <span>{item.name}</span>
              </div>
            )
          }
        />

        {/* 加入我们 */}
        <div className={styles.ad}>
          <img src={BASE_URL + "/img/profile/join.png"} alt="" />
        </div>
      </div>
    );
  }
}
