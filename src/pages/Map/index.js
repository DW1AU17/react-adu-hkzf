import React, { Component } from "react";
import "./index.scss";

const BMap = window.BMap;

  // 使用 H5 中地理位置API
  // postion 对象中，常用属性的文档：
  // https://developer.mozilla.org/zh-CN/docs/Web/API/Coordinates
  navigator.geolocation.getCurrentPosition(position => {
    console.log("current location info:", position)
  })

export default class Map extends Component {
  componentDidMount() {
    // 创建百度地图对象
    // 参数: 表示地图容器的id值
    const map = new BMap.Map('container')
    // 设置地图中心点坐标
    const point = new BMap.Point(120.180176, 30.3501845)
    // 使用中心店坐标初始化地图
    map.centerAndZoom(point, 18)
  }

  render() {
    return (
      <div className="map">
        {/* 地图容器 */}
        <div id="container" className="container" />
      </div>
    )
  }
} 

