import React, { Component } from "react";

import { Flex } from "antd-mobile";
import { API, getCurrentCity, BASE_URL } from "../../utils";

// 使用长列表
import {
  List,
  AutoSizer,
  WindowScroller,
  InfiniteLoader
} from "react-virtualized";

// 引入封装的吸顶组件
import Sticky from "../../components/Sticky";

import SearchHeader from "../../components/SearchHeader";
import Filter from "./components/Filter";

import styles from "./index.module.scss";
import HouseItem from "../../components/HouseItem";
import NoHouse from "../../components/NoHouse";

// 房源列表每一项高度
const HOUSE_ITEM_HEIGHT = 120;

export default class HouseList extends Component {
  state = {
    count: 0,
    list: [],
    isLoaded: false  // 判断数据是否加载完成
  };

  async componentDidMount() {
    const { value, label } = await getCurrentCity();
    this.value = value;
    this.label = label;
    this.searchHouseList();
  }

  // 1. 接受 Filter组件传递过来的数据
  onFilter = filter => {
    // 1.1 将过滤对象存到this中
    this.filter = filter;
    // 1.2 根据查询条件获取房源的数据
    this.searchHouseList();
  };

  // 2. 根据查询条件获取房源列表
  async searchHouseList(start = 1, end = 20) {
    // 2.1 根据当前城市的id (把当前城市数据, 存到this中, 方便公用)
    // 2.2 调用ajax
    const res = await API.get("/houses", {
      params: {
        ...this.filter,
        cityId: this.value,
        start,
        end
      }
    });
    // 2.3 存到state中
    const { list, count } = res.data.body;
    this.setState({
      list,
      count,
      isLoaded: true  // 数据加载完成
    });
  }

  // 渲染每一项房源数据
  rowRenderer = ({ key, index, style }) => {
    // 均为组件自带的参数
    const { list } = this.state;
    const item = list[index]; // 每一项的参数
    // 当滚动太快时, 会获取不到数据, 此时设置一个loading元素占位
    if (!item) {
      return (
        <div key={key} style={style}>
          <p className={styles.loading}></p>
        </div>
      );
    }

    return (
      <HouseItem
        key={key}
        // 传递style 给HouseItem组件
        style={style}
        {...item}
        houseImg={`${BASE_URL}${item.houseImg}`}
        onClick={() => this.props.history.push(`/detail/${item.houseCode}`)}
      />
    );
  };

  // 判断当前行是否加载完成
  isRowLoaded = ({ index }) => {
    // 滚动时判断当前index在房源列表中是否存在, 为空, 就说明需要加载了, 返回false
    return !!this.state.list[index]; // 转布尔
  };

  // 加载更多数据 (下一次需要加载的开始的index, 和结束的index)
  loadMoreRows = ({ startIndex, stopIndex }) => {
    // 文档中说要返回promise对象
    return new Promise(async resolve => {
      // 调接口拿数据
      const res = await API.get("/houses", {
        params: {
          ...this.filter,
          cityId: this.value,
          start: startIndex,
          end: stopIndex
        }
      });
      resolve();
      // 存到state的list中, 是追加
      const { list, count } = res.data.body;
      this.setState({
        list: [...this.state.list, ...list],
        count
      });
    });
  };

  renderHouseList() {
    const { count, isLoaded } = this.state;
    // 数据加载完成 并且 在没有匹配到数据时展示
    if (isLoaded && count <= 0) {
      return <NoHouse>没有找到房源，请换个搜索条件！</NoHouse>
    }

    return (
      // {/* 3. 滚动时进行数据的提取 , 使用InfiniteLoader组件 */}
      <InfiniteLoader
        isRowLoaded={this.isRowLoaded} // 确定当前行是否加载完成, {index} 可拿到形参
        loadMoreRows={this.loadMoreRows} // 加载更多数据, {startIndex, stopIndex} 可拿到形参
        minimumBatchSize={20} // 加载一次的获取的最小数据
        rowCount={count} // 总的数量
      >
        {/* 2. 让List组件能够基于窗口位置进行滚动的高阶组件，WindowScroller(原来在autoSizer中的height就被该组件中的height代替) */}
        {({ onRowsRendered, registerChild }) => (
          <WindowScroller>
            {/* 1. 让宽高占满， 需要用到高阶组件 AutoSizer  */}
            {({ height, isScrolling, scrollTop }) => {
              return (
                <AutoSizer>
                  {({ width }) => (
                    <List
                      width={width}
                      height={height}
                      rowCount={count} // 列表长度（总共几项）
                      rowHeight={HOUSE_ITEM_HEIGHT} // 每一项的高度
                      rowRenderer={this.rowRenderer} // 渲染list的每一项
                      scrollTop={scrollTop} // 距离顶部的距离 / WindowScroller
                      isScrolling={isScrolling} // 是否在滚动 / WindowScroller
                      autoHeight // 实现基于窗口位置滚动 / WindowScroller
                      onRowsRendered={onRowsRendered} // 滚动时, 通知加载程序 / InfiniteLoader
                      ref={registerChild} // 数据加载完, 刷新  / InfiniteLoader
                    />
                  )}
                </AutoSizer>
              );
            }}
          </WindowScroller>
        )}
      </InfiniteLoader>
    );
  }

  render() {
    return (
      <div className={styles.root}>
        {/* 头部搜索 */}
        <Flex className={styles.listHeader}>
          <i className="iconfont icon-back"></i>
          {/* 重要: 对公共组件添加样式需要传入样式, 然后在组件中添加 */}
          <SearchHeader cityName="上海" className={styles.listSearch} />
        </Flex>

        {/* 条件筛选栏 */}
        {/* 增加吸顶功能 */}
        <Sticky height={45}>
          <Filter onFilter={this.onFilter} />
        </Sticky>

        {/* 房源列表 / 使用virtualized长列表插件 */}
        <div className={styles.houseList}>{this.renderHouseList()}</div>
      </div>
    );
  }
}
