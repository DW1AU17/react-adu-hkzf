import React, { Component } from "react";
import { Carousel, Flex, Grid, WingBlank} from "antd-mobile";
import { Link } from "react-router-dom";
// 使用axios
import axios from "axios";
import "./index.scss";
// 本地图片一定要引入后才能使用
import nav1 from "../../assets/images/nav-1.png";
import nav2 from "../../assets/images/nav-2.png";
import nav3 from "../../assets/images/nav-3.png";
import nav4 from "../../assets/images/nav-4.png";

// BMap 是全局对象
const BMap = window.BMap;

export default class Index extends Component {
  state = {
    groups: [], // 租房小组数据
    swiper: [], // 轮播图数据
    news: [],   // 资讯数据 
    imgHeight: 212,
    isSwiperLoading: true, // 判断数据是否已获得
    cityName: "上海"  // 当前城市默认上海
  };

  // 获取轮播图数据
  async getSwipers() {
    let res = await axios.get("http://localhost:8080/home/swiper");
    this.setState({
      swiper: res.data.body,
      isSwiperLoading: false
    });
  }
  // 获取租房小组数据
  async getGroups() {
    let res = await axios.get("http://localhost:8080/home/groups");
    this.setState({
      groups: res.data.body
    });
  }
  // 获取最新资讯数据
  async getNews() {
    let res = await axios.get('http://localhost:8080/home/news')
    this.setState({
      news: res.data.body
    });
  }

  componentDidMount() {
    this.getSwipers()
    this.getGroups()
    this.getNews()

    // 通过百度地图获取当前城市信息 / BMap是全局对象, 所以要window.BMap
    const myCity = new BMap.LocalCity();
    myCity.get(async result => {
      // 1.获取当前城市的名字
      var cityName = result.name;
      // 2.根据名字获取当前城市的信息
      // const res = await axios.get(`http://localhost:8080/area/info?name=${cityName}`)    // 推荐使用下面
      const res = await axios.get("http://localhost:8080/area/info",{
        params: {name: cityName}
      })
      // 3. 把城市信息存到localstorage中,(并把城市名字存到state中)
      const { label, value } = res.data.body
      this.setState({
        cityName: label
      })
      localStorage.setItem("city_info", JSON.stringify({label, value}))

    });


    // 使用 H5 中地理位置API
    // postion 对象中，常用属性的文档：
    // navigator.geolocation.getCurrentPosition(position => {
    //   console.log("current location info:", position)
    // })
  }

  // 渲染轮播图
  renderSwiper() {
    return this.state.swiper.map(item => (
      <a
        key={item.id}
        href="http://www.alipay.com"
        style={{
          display: "inline-block",
          width: "100%",
          height: this.state.imgHeight
        }}
      >
        <img
          src={`http://localhost:8080${item.imgSrc}`}
          alt=""
          style={{ width: "100%", verticalAlign: "top" }}
          onLoad={() => {
            // 屏幕大小改变时,触发 resize事件 ,改变图片高度
            window.dispatchEvent(new Event("resize"));
            this.setState({ imgHeight: "auto" });
          }}
        />
      </a>
    ));
  }
  // 渲染最新资讯
  renderNews() {
    return this.state.news.map(item => (
      <div className="news-item" key={item.id}>
        <div className="imgwrap">
          <img src={`http://localhost:8080${item.imgSrc}`} alt=""/>
        </div>
        <Flex className="content" direction="column" justify="between">
          <h3 className="title">{item.title}</h3>
          <Flex className="info" justify="between">
            <span>{item.from}</span>
            <span>{item.date}</span>
          </Flex>
        </Flex>
      </div>
    ))
  }

  render() {
    return (
      <div className="index">
        {/* 轮播图 */}
        <div className="swiper">
          {/* 顶部搜索导航 */}
          <Flex className="search-box">
            <Flex className="search-left">
              <div 
                className="location"
                onClick={() => this.props.history.push("/citylist")}
              >
                <span>{this.state.cityName}</span>
                <i className="iconfont icon-arrow" />
              </div>
              <div 
                className="search-form"
                onClick={() => this.props.history.push("/search")}  
              >
                <i className="iconfont icon-seach" />
                <span>请输入小区或地址</span>
              </div>
            </Flex>
            <i 
              className="iconfont icon-map" 
              onClick={() => this.props.history.push("/map")}
            />
          </Flex>

          {/* 问题: 轮播图不自动轮播 (因为state.swiper中缺少数据)
              解决: 当swiper数组中有数据后再渲染轮播图 (设置isSwiperLoading)  */}
          {/* 当有数据后渲染轮播图, 解决轮播图不自动轮播问题 */}
          {!this.state.isSwiperLoading && (
            <Carousel autoplay={true} infinite>
              {this.renderSwiper()}
            </Carousel>
          )}
        </div>

        {/* 导航菜单 */}
        <Flex className="nav">
          <Flex.Item>
            <Link to="/home/list">
              <img src={nav1} alt="" />
              <p>整租</p>
            </Link>
          </Flex.Item>
          <Flex.Item>
            <Link to="/home/list">
              <img src={nav2} alt="" />
              <p>合租</p>
            </Link>
          </Flex.Item>
          <Flex.Item>
            <Link to="/map">
              <img src={nav3} alt="" />
              <p>地图找房</p>
            </Link>
          </Flex.Item>
          <Flex.Item>
            <Link to="/rent/add">
              <img src={nav4} alt="" />
              <p>去出租</p>
            </Link>
          </Flex.Item>
        </Flex>

        {/* 租房小组 */}
        <div className="groups">
          <Flex justify="between" className="groups-title">
            <h3>租房小组</h3>
            <span>更多</span>
          </Flex>
          {/* 使用九宫格实现布局 */}
          <Grid
            className="grid"
            data={this.state.groups}  // 提供数据
            columnNum={2}
            hasLine={false}
            square={false}
            activeStyle
            renderItem={item => (
              <Flex justify="between" className="grid-item">
                <div>
                  <p>{item.title}</p>    
                  <span>{item.desc}</span>    
                </div>  
                <div>
                  <img src={`http://localhost:8080${item.imgSrc}`} alt="" />
                </div>
              </Flex>  
            )}
          />
        </div>
     
        {/* 最新资讯 */}
        <div className="news">
          <h3 className="group-title">最新资讯</h3>
          <WingBlank size="md">{this.renderNews()}</WingBlank>
        </div>

      </div>
    );
  }
}
