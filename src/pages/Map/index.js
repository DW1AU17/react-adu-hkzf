import React, { Component } from "react";
// 引入公共头部
import NavHeader from "../../components/NavHeader";
// 获取当前定位城市 (API代替axios)
import { getCurrentCity, API, BASE_URL } from "../../utils";
// 使用第三方库 处理类名
import classNames from "classnames"
// 引入loading效果的轻提示
import { Toast } from 'antd-mobile';


import "./index.scss";
import styles from "./index.module.css";
import HouseItem from "../../components/HouseItem";
const BMap = window.BMap;

// 使用 H5 中地理位置API
// postion 对象中，常用属性的文档：
// https://developer.mozilla.org/zh-CN/docs/Web/API/Coordinates
// navigator.geolocation.getCurrentPosition(position => {
//   console.log("current location info:", position)
// })

// 2.4 覆盖物样式
const labelStyle = {
  cursor: "pointer",
  border: "0px solid rgb(255, 0, 0)",
  padding: "0px",
  whiteSpace: "nowrap",
  fontSize: "12px",
  color: "rgb(255, 255, 255)",
  textAlign: "center"
};

export default class Map extends Component {
  state = {
    houseList: [], // 房源数据列表
    isShowHouseList: false // 是否展示房源列表
  };
  componentDidMount() {
    this.initMap(); // 1. 根据当前城市, 进行定位 (初始化定位)
  }

  // 1. 初始化地图
  async initMap() {
    // 1.1 当前城市
    let { label, value } = await getCurrentCity();
    // 1.2 创建百度地图对象(参数: 表示地图容器的id值)
    const map = new BMap.Map("container");
    // 为能在其他方法中使用，存到this中
    this.map = map;
    // 1.3 创建地址解析器(获取当前地址)
    const myGro = new BMap.Geocoder();
    // 1.4 将地址解析结果显示在地图上, 并调整缩放 myGro.getPoint(地址,回调,城市)
    myGro.getPoint(
      label,
      async point => {
        // 1.5 成功则返回中心点坐标 point
        // 1.6 使用中心店坐标初始化地图
        map.centerAndZoom(point, 11); // zoom: 11 缩放比例 (值越大,缩的越大)
        // 1.7 添加常用的控件 map.addControl
        map.addControl(new BMap.NavigationControl()); // 缩放
        map.addControl(new BMap.ScaleControl()); // 尺

        /* 3. 
          第一次不同点击: 默认渲染城市下的所有区  -> 圆形
          第二次点击: 区下面的所有镇      -> 圆形 ,  放大地图 , 清除之前的区的覆盖物
          第三次点击: 镇下面的所有的小区  -> 方形 , 放大地图 , 清除之前的镇的覆盖物
          3.1 第一个函数：渲染覆盖物数据的函数
              3.1.1 获取（区，镇，小区）的数据list
              3.1.2 第二个函数：获取当前需要渲染覆盖物的 比例 形状类型
              3.1.3 遍历渲染覆盖物 ，调用第三个函数
          3.2 第二个函数： 根据当前的缩放等级,（获取下一次渲染地图的缩放等级 ，以及覆盖物的形状）
              3.2.1 获取当前的缩放比例   this.map.getZoom()  百度Api
              3.2.2 根据当前的缩放比例， 获取下一次要渲染的比例，和覆盖物类型（形状） 返回 比例， 类型
          3.3 第三个函数： 根据返回的类型 判断渲染 (区、镇) 还是 (小区) 调用相应第四函数渲染
          3.4 第四个函数： 渲染区，镇 的覆盖物 / 渲染小区 的覆盖物 （步骤就是 2 ）
                  注册点击事件： 1）调用第一个函数， 并清除覆盖物
                                2）小区的则是另外的
        */
        // 3.1 第一次默认区的覆盖区数据渲染
        this.renderOverlays(value);
      },
      label
    );

    // 5. 给地图绑定移动事件
    map.addEventListener("movestart", () => {
      // 隐藏房源表
      this.setState({
        isShowHouseList: false
      })
    })
  }

  // 3.1 获取要渲染的数据， 以及下一次渲染的比例 和 类型
  async renderOverlays(id) {
    // 3.end 获取数据前添加loading
    Toast.loading('Loading...', 30, null, false);
    // 获取渲染的数据
    const res = await API.get("/area/map", {
      params: { id }
    });
    // 3.end 得到数据后关闭loading
    Toast.hide()
    // 获取比例和类型
    const { nextZoom, type } = this.getZoomAndType();
    // 遍历渲染覆盖物
    res.data.body.forEach(item => {
      this.createOverlays(nextZoom, type, item);
    });
  }
  // 3.2 获取要渲染的 类型 和 缩放等级
  getZoomAndType() {
    // 获取当前的比例
    const curZoom = this.map.getZoom();
    // 下一级缩放 和 类型
    let nextZoom;
    let type;
    // 一开始定位渲染的页面比例是 11, 第一次调用渲染的也就是区的数据
    // 根据当前的比例获取下级的参数
    //  10<=   区   <12  当前所在的范围 => 要获取的下级区是 13
    //  12<=   镇   <14  当前所在的范围 => 要获取的下级镇是 15
    //  14<=  小区  <16  当前所在的范围 =>
    if (curZoom >= 10 && curZoom < 12) {
      // 区
      nextZoom = 13;
      type = "circle"; // 原型
    } else if (curZoom >= 12 && curZoom < 14) {
      // 镇
      nextZoom = 15;
      type = "circle";
    } else {
      // 小区
      type = "rect"; // 矩形
      nextZoom = 99;
    }
    return { nextZoom, type };
  }
  // 3.3 判断渲染区,镇还是小区
  createOverlays(nextZoom, type, item) {
    // 区镇 / 小区的html模板
    let circleTemplate = `
      <div class="${styles.bubble}">
        <p class="${styles.name}">${item.label}</p>
        <p>${item.count}套</p>
      </div>`;
    let rectTemplate = `
      <div class="${styles.rect}">
        <span class="${styles.housename}">${item.label}</span>
        <span class="${styles.housenum}">${item.count}套</span>
        <i class="${styles.arrow}"></i>
      </div>`;
    // 区镇 / 小区的偏移距离
    let circleOffset = [-35, -35];
    let rectOffset = [-50, -24];

    if (type === "circle") {
      // 渲染区, 镇
      this.createCircle(item, nextZoom, circleTemplate, circleOffset);
    } else {
      // 渲染小区
      this.createCircle(item, nextZoom, rectTemplate, rectOffset);
    }
  }
  // 3.4 渲染覆盖物
  createCircle(item, zoom, template, offset) {
    // 2.3 获取覆盖物的坐标
    let {
      coord: { longitude, latitude }
    } = item;
    let itemPoint = new BMap.Point(longitude, latitude);
    // 2.4 覆盖物位置
    let opts = {
      position: itemPoint, // 覆盖物的中心坐标
      offset: new BMap.Size(offset[0], offset[1]) // 设置偏移量
    };
    // 2.1 覆盖物创建
    let label = new BMap.Label("", opts);
    // 2.2 覆盖物设置为 HTML 标签(不是JSX)
    label.setContent(template);
    // 2.5 覆盖物样式 (提到组件外)
    label.setStyle(labelStyle);
    // 2.7 添加到地图
    this.map.addOverlay(label);
    // 2.8 添加单击事件 (这不是原生中的addEventListener,这是百度Api中的)
    label.addEventListener("click", e => {
      if (zoom < 99) {
        // 2.9 调用renderOverlays函数, 渲染下一级
        this.renderOverlays(item.value);
        // 2.10 清除当前的覆盖物(需要有延迟, 不然会报错)
        setTimeout(() => {
          this.map.clearOverlays(); // 百度Api
        }, 0);
        // 2.11 放大地图 (方大到zoom)
        this.map.centerAndZoom(itemPoint, zoom);
      } else {
        // 当前是小区
        // 4.1 展示房源数据的列表
        this.getCommunityHouses(item.value);
        // 4.2 点击后 将该小区移动到可视区的中心(通过事件对象e获取该覆盖物到页面的参数) e.changedTouches
        // 移动的是相对当前位置的距离
        // 获取当前位置,再获取偏移的距离
        const { clientX, clientY } = e.changedTouches[0]
        const x = window.innerWidth / 2 - clientX
        const y = (window.innerHeight - 330 + 45) / 2 - clientY
        
        // 将地图在水平或垂直方向上移动一定的距离
        this.map.panBy(x, y)
      }
    });
  }

  // 4. 展示房源列表
  async getCommunityHouses(id) {
    // 4.3 在获取数据之前添加loading效果
    Toast.loading('Loading...', 30, null, false);
    const res = await API.get("/houses", {
      params: { cityId: id }
    });

    // 4.4 得到数据后隐藏loading
    Toast.hide()

    // 展示在页面, 所以需要存到state中  (展示数据)
    this.setState({
      isShowHouseList: true,
      houseList: res.data.body.list
    });
  }

  // 渲染houselist每一项
  renderHouseItem() {
    // 遍历state中的数据
    return this.state.houseList.map(item => {
      item.houseImg = `${BASE_URL}${item.houseImg}`
      return (
        <HouseItem 
          key={item.houseCode}
          {...item}
          onClick={() => this.props.history.push(`/detail/${item.houseCode}`)}
        />
      )
    })
  }

  render() {     
    return (
      <div className="map">
        {/* 头部导航 */}
        <NavHeader>地图找房</NavHeader>
        {/* 地图容器 */}
        <div id="container" className="container" />

        {/* 房源数据列表 */}
        {/* 可以直接通过三元 */}
        {/* <div className={[styles.houseList,styles.show ].join(' ')}>  */}
        <div className={classNames(styles.houseList, {[styles.show]: this.state.isShowHouseList})}>
          <div className={styles.titleWrap}>
            <h1 className={styles.listTitle}>房屋列表</h1>
            <a className={styles.titleMore} href="/house/list">
              更多房源
            </a>
          </div>
          {/* 渲染每一项的函数 */}
          <div className={styles.houseItems}>{this.renderHouseItem()}</div>
        </div>
      </div>
    );
  }
}
