import React, { Component } from "react";

import { SearchBar } from "antd-mobile";

import { getCity, API } from "../../../utils";

// 引入Lodash， 可以全部引入， 可以部分引入
import _ from "lodash";

import styles from "./index.module.css";

export default class Search extends Component {
  // 当前城市id
  cityId = getCity().value;

  state = {
    // 搜索框的值
    searchTxt: "",
    tipsList: []
  };

    // 初始化timerId
    // timerId = null

  // 使用lodash处理 搜索 
  search = _.debounce(async val => {
    // 发送请求获取小区数据
    const res = await API.get("/area/community", {
      params: {
        name: val,
        id: this.cityId
      }
    });
    const { body } = res.data;
    this.setState({
      tipsList: body.map(item => ({
        community: item.community,
        communityName: item.communityName
      }))
    });
  }, 500);

  // 根据关键词搜索小区信息 (得到输入的值， val)
  handleSearchTxt = async val => {
    // 不能为空
    if (val.trim() === "") {
      return this.setState({
        searchTxt: "",
        tipsList: []
      });
    }
    // 赋值给state中的数据
    this.setState({
      searchTxt: val
    });
    // 发送请求获取小区数据
    /************** 使用lodash组件 **************/
    this.search(val);

    /************** 以下手写方法 ***************/
    // clearTimeout(this.timerId);
    // // 解决每输入一个就搜索 (itemrId 不能用声明，而是存到this中，确保每次能删除)
    // // 键盘按下500ms后去执行调用，再500ms内又敲击键盘会清除定时器， 重新开始新的500ms
    // // 插件解决， 用Lodash
    // this.timerId = setTimeout(async () => {
    //   const res = await API.get("/area/community", {
    //     params: {
    //       name: val,
    //       id: this.cityId // 当前城市的id
    //     }
    //   });
    //   console.log(res);
    //   // 赋值给state
    //   const { body } = res.data;
    //   // 只需要两个数据
    //   this.setState({
    //     tipsList: body.map(item => ({
    //       community: item.community,
    //       communityName: item.communityName
    //     }))
    //     // item => {return ({ })}
    //   });
    // }, 500);
  };

  // 渲染搜索结果列表
  renderTips = () => {
    const { tipsList } = this.state;

    return tipsList.map(item => (
      <li 
        key={item.community} 
        className={styles.tip}
        onClick={this.handleClick.bind(this, item)}  // 
      >
        {item.communityName}
      </li>
    ));
  };

  // 获取小区信息，跳转到添加页面
  handleClick = ({ community, communityName }) => {
    // 添加到路由额外参数中
    this.props.history.replace('/rent/add', {
      community, 
      communityName
    })
  } 

  render() {
    const { history } = this.props;
    const { searchTxt } = this.state;

    return (
      <div className={styles.root}>
        {/* 搜索框 */}
        <SearchBar
          placeholder="请输入小区或地址"
          value={searchTxt}
          showCancelButton={true}
          onCancel={() => history.replace("/rent/add")}
          onChange={this.handleSearchTxt}
        />

        {/* 搜索提示列表 */}
        <ul className={styles.tips}>{this.renderTips()}</ul>
      </div>
    );
  }
}
