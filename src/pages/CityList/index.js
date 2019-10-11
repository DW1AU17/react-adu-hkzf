import React from "react";
import { NavBar } from 'antd-mobile';
import axios from 'axios';
import './index.scss';
// 获取当前城市方法
import { getCurrentCity } from '../../utils';
// react-virtualized 组件 ( 文档中找到list组件 )
import { List , AutoSizer} from 'react-virtualized'

// 当点击城市时候需要把城市存到localstorage中 并把返回index页面

// 2.1 处理城市的格式
const formatCityList = list => {
  // cityList: {a:[{label:'安庆',value:'..'},{label:'安吉',value:'..'}], b:[] , c:[]... }
  // cityIndex: ['a' ,'b'....]
  // 2.1.1 ( 获取cityList )首字母相同的城市放在同一个数组中
  const cityList = {}
  list.forEach(item => {
    // 2.1.2 获取城市首字母
    const firstLetter = item.short.substr(0, 1)
    // 2.1.3 判断 对象中是否存在 该索引
    if (firstLetter in cityList) {
      // 2.1.4存在则push
      cityList[firstLetter].push(item)
    }else {
      // 2.1.5不存在则新建
      cityList[firstLetter] = [item]
    }
  });
  // 2.2 ( cityIndex ) 获取cityList所有的键/ 并排序  (通过es6语法)
  const cityIndex = Object.keys(cityList).sort()
  // 2.3 返回一个对象  
  return {cityList, cityIndex}
}

// 数据源 (List组件渲染的 原始样式)
// const list = Array.from(new Array(100)).map((t,i) => "!aaa" + i)

// function rowRenderer ({
//   key,         // Unique key within array of rows
//   index,       // Index of row within collection
//   isScrolling, // The List is currently being scrolled
//   isVisible,   // This row is visible within the List (eg it is not an overscanned row)
//   style        // Style object to be applied to row (to position it)
// }) {
//   return (
//     <div
//       key={key}
//       style={style}
//     >
//       {list[index]}
//     </div>
//   )
// }

// 处理城市索引
const formatCityIndex = letter => {
  switch(letter) {
    case '#':
      return '当前定位'
    case 'hot':
      return '热'
    default:
      // 默认返回大写
      return letter.toUpperCase()
  }
}

// 索引高度，城市高度
const INDEX_HEIGHT = 36
const CITY_HEIGHT = 50

export default class CityList extends React.Component {
  state = {
    cityList: {},
    cityIndex: [],
    activeIndex: 0   // 右侧默认高亮的索引
  }

  // 第一步: 创建 ref 对象, 用来获取 list组件的实例
  listRef = React.createRef()

  // 1. 获取所有城市信息
  async getCityList() {
    let res = await axios.get("http://localhost:8080/area/city?level=1")
    // 2. 把得到的数据处理成想要的格式 (交给一个函数处理数据)
    const {cityList, cityIndex} = formatCityList(res.data.body)
    // 3. 获取热门城市, 一并添加到两个数据中
    let hosRes = await axios.get("http://localhost:8080/area/hot")
    // 3.1 添加index 到cityIndex最前面 / 热门城市信息存到cityList
    cityIndex.unshift("hot")  // 因为要根据键 查数据, 不能用汉子
    cityList["hot"] = hosRes.data.body
    // 4. 获取当前城市信息存到 两个数据中
    let curCity = await getCurrentCity()
    cityIndex.unshift("#")  // 因为要根据键 查数据, 不能用汉子
    cityList["#"] = [curCity]
    // 5. 存到state中
    this.setState({
      cityList, 
      cityIndex
    })
  }

  async componentDidMount() {
    await this.getCityList();  // 获取所有城市

    // 调用list实例上的measureAllRows方法,提前计算每一行高度, 弥补scrollToRow方法的不足 ( 但是比较耗性能 )
    // 要等到列表渲染完再调用, 所以给获取城市加上 await
    this.listRef.current.measureAllRows()
  }

  // 渲染每一项
  rowRenderer = ({key, index, style}) => {
    // 1. 索引只有一个， 城市名可能有多个 ( 索引下的城市，需要遍历获取 )
    const { cityList, cityIndex } = this.state
    // 2. 字母索引
    const letter = cityIndex[index]
    // 3. 通过索引得到城市列表数据
    const list = cityList[letter]

    return (
      <div key={key} style={style} className="city">
        {/* 5. 处理索引的值 */}
        <div className="title">{formatCityIndex(letter)}</div>
        {/* 4. 遍历数组 */}
        {list.map(item => (
          <div key={item.value} className="name">
            {item.label}
          </div>
        ))}
      </div>
    )
  }

  // 得到每一项高度
  calcRowHeight = ({index}) => {
    // rowHeight 如果是个函数则默认有一个index参数 （仔细查看官网）
    // 获取每一项的数据
    const { cityIndex, cityList } = this.state
    const letter = cityIndex[index]
    const list = cityList[letter]
    // 计算公式 索引高36 + 每行高50 * 几个城市 
    // 必须要有返回值
    return INDEX_HEIGHT + CITY_HEIGHT * list.length
  }

  // 点击时高亮索引, 并使其滚动到指定位置
  goToCityIndex = index =>{
    // 文档中 scrollToRow 滚动到指定位置, 参数为索引值 
    // 但是: 前提是已经滚动过得区域,不然会有偏差  (' 解决这个:  通过调用实例上的measureAllRows方法,提前计算每一项高度') 渲染完列表后调用
    // 方法的使用说明: 官网中没有, 这是组件的实例方法(在原型上), 所以要先得到组件的实例(通过ref) 
    // 第三步: 获取实例对象,并调用其方法 scrollToRow, 参数为index(也就是索引)
    this.listRef.current.scrollToRow(index)   //需要属性scrollToAlignment 配合 ,滚动到头部

  }

  // 渲染右侧索引
  renderCityIndex() {
    const { cityIndex, activeIndex } = this.state
    // 返回每一项li
    return cityIndex.map((item, index) => (
      <li
        className="city-index-item"
        key={item}
        // 点击跳转到默认的位置
        onClick={() => this.goToCityIndex(index)}
      >
        {/* 高亮类名：当前index等于活动index时高亮 */}
        <span className={index === activeIndex ? 'index-active' : ''}>
          {/* 转大写, 处理hot */}
          {item === 'hot' ? '热' : item.toUpperCase()}
        </span>
      </li>
    ))
  }

  // list组件滚动时,会触发
  onRowsRendered = ({startIndex}) => {  // (可得到每一项开始时的index值) 好几个参数
    // 滚动到每一项的每一列都会触发
    // 当数值发生变化时触发, 
    if (startIndex !== this.state.activeIndex) {
      this.setState({
        activeIndex: startIndex
      })
    }
  }

  render() {
    return (
      <div className="citylist">
        <NavBar
          className="navbar"
          mode="light"
          icon={<i className="iconfont icon-back" />}
          onLeftClick={() => console.log("onLeftClick")}
        >
          城市选择
        </NavBar>
        {/* 城市列表 */}
        {/* 1. 让宽高占满， 需要用到高阶组件 AutoSizer  */}
        <AutoSizer>
          {({width, height}) => (
            <List
              ref={this.listRef}  // 第二步, 设置ref属性, 并把实例参数作为值传入
              width={width}
              height={height}
              rowCount={this.state.cityIndex.length}   // 每一项是根据 索引一整项
              rowHeight={this.calcRowHeight}  // （查官网）可以是数值或函数（函数默认有一个index参数）
              rowRenderer={this.rowRenderer}  // 渲染list的每一项
              onRowsRendered={this.onRowsRendered}   // list 滚动时会触发
              scrollToAlignment="start"   // 控制滚动到行的位置, start为头部
            />
          )}
        </AutoSizer>

        {/* 右侧城市索引列表 */}
        <ul className="city-index">{this.renderCityIndex()}</ul>

      </div>
    );
  }
}
