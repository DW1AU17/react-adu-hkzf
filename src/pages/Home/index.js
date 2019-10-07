import React from "react";
import { Route } from "react-router-dom";
// 引入组件
import HouseList from "../HouseList";
import News from "../News";
import Profile from "../Profile";
import Index from "../Index";
// 引入 tabBar 组件
import { TabBar } from "antd-mobile";
// import "./index.scss";
import './index.scss'

// tab的菜单数据
const HOMELIST = [
  { name: "首页", icon: "icon-ind", path: "/home" },
  { name: "找房", icon: "icon-findHouse", path: "/home/houselist" },
  { name: "资讯", icon: "icon-infom", path: "/home/news" },
  { name: "我的", icon: "icon-my", path: "/home/mine" }
];

export default class Home extends React.Component {
  state = {
    // 当前选中的 tab 菜单
    selectedTab: this.props.location.pathname
  };

  componentDidUpdate(prevProps,prevStates) {
    // 处理tabBar高亮问题
    const prevPathname = prevProps.location.pathname
    const pathname = this.props.location.pathname
    if (prevPathname !== pathname) {
      this.setState({
        selectedTab: pathname
      })
    }
  }

  // 封装 tabBar 组件
  renderTabBarItems = () => {
    return HOMELIST.map(item => (
      <TabBar.Item
        title={ item.name }
        key={ item.icon }
        icon={<i className={`iconfont ${item.icon}`} />}
        selectedIcon={<i className={`iconfont ${item.icon}`} />}
        selected={this.state.selectedTab === item.path}
        onPress={() => {
          this.props.history.push(item.path);
          // 解决tab栏高亮问题 (在更新钩子处理高亮,这边省略)
          // this.setState({
          //   selectedTab: item.path
          // });
        }}
      />
    ));
  };

  render() {
    return (
      <div className="home"> 
        {/* 去掉了index, 是为了在localhost:3000/home时 默认访问 localhost:3000/home/index; 需精确匹配 */}
        <Route exact path="/home" component={Index} />
        <Route path="/home/houselist" component={HouseList} />
        <Route path="/home/news" component={News} />
        <Route path="/home/mine" component={Profile} />

        {/* tabBar 组件 */}
        <div className="tab-bar">
          {/* noRenderContent 不渲染内容部分 (默认展示tabBar页面是通过类似轮播图的形式,我们用的是单页面所以不需要) */}
          <TabBar tintColor="#21B97A" noRenderContent >
            {/* 调用 tabBar 渲染函数 */}
            {this.renderTabBarItems()}
          </TabBar>
        </div>
      </div>
    );
  }
}
