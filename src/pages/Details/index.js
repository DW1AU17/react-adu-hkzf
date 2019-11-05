import React, { Component } from "react";

// 引入轮播图组件
import { Carousel, Flex, Modal, Toast } from "antd-mobile";

import NavHeader from "../../components/NavHeader";
import HouseItem from "../../components/HouseItem";
import HousePackage from "../../components/HousePackage";

import { BASE_URL, API, isAuth, getToken } from "../../utils";

import styles from "./index.module.scss";

// 猜你喜欢
const recommendHouses = [
  {
    id: 1,
    houseImg: "http://localhost:8080/newImg/7bk83o0cf.jpg",
    desc: "72.32㎡/南 北/低楼层",
    title: "安贞西里 3室1厅",
    price: 4500,
    tags: ["随时看房"]
  },
  {
    id: 2,
    houseImg: "http://localhost:8080/newImg/7bk83o0cf.jpg",
    desc: "83㎡/南/高楼层",
    title: "天居园 2室1厅",
    price: 7200,
    tags: ["近地铁"]
  },
  {
    id: 3,
    houseImg: "http://localhost:8080/newImg/7bk83o0cf.jpg",
    desc: "52㎡/西南/低楼层",
    title: "角门甲4号院 1室1厅",
    price: 4300,
    tags: ["集中供暖"]
  }
];

// 百度地图
const BMap = window.BMap;

// 百度地图样式
const labelStyle = {
  position: "absolute",
  zIndex: -7982820,
  backgroundColor: "rgb(238, 93, 91)",
  color: "rgb(255, 255, 255)",
  height: 25,
  padding: "5px 10px",
  lineHeight: "14px",
  borderRadius: 3,
  boxShadow: "rgb(204, 204, 204) 2px 2px 2px",
  whiteSpace: "nowrap",
  fontSize: 12,
  userSelect: "none"
};

export default class Details extends Component {
  state = {
    isLoading: false,

    houseInfo: {
      // 房屋图片
      houseImg: [],
      // 标题
      title: "",
      // 标签
      tags: [],
      // 租金
      price: 0,
      // 房型
      roomType: "两室一厅",
      // 房屋面积
      size: 89,
      // 装修类型
      renovation: "精装",
      // 朝向
      oriented: [],
      // 楼层
      floor: "",
      // 小区名称
      community: "",
      // 地理位置
      coord: {
        latitude: "39.928033",
        longitude: "116.529466"
      },
      // 房屋配套
      supporting: [],
      // 房屋标识
      houseCode: "",
      // 房屋描述
      description: ""
    },
    isFavorite: false // 判断房源是否收藏
  };

  componentDidMount() {
    // 得到地址中的id
    const { id } = this.props.match.params;
    // 获取房源数据
    this.getHouseDetail(id);
    // 判断房源是否收藏
    this.checkFavorite(id);
  }

  // 5. 判断房源是否收藏
  async checkFavorite(id) {
    // 判断是否登录(没登录就不需要知道是否收藏)
    if (!isAuth()) return;

    // 注意请求方式
    // user/favorites?id=
    // API.get("/user/favorites",{ params: { id }})
    // 处理API中携带token (在api.js)
    const res = await API.get(`/user/favorites/${id}`);

    const { status, body } = res.data;
    if (status === 200) {
      // 得到是否收藏
      this.setState({
        isFavorite: body.isFavorite
      });
    } else {
      // 登录失败, 不错处理
    }
  }

  // 2. 获取房源详细信息
  async getHouseDetail(id) {
    // 开启loading
    this.setState({
      isLoading: true
    });

    const res = await API.get(`/houses/${id}`);

    this.setState({
      houseInfo: res.data.body,
      isLoading: false
    });
    const { community, coord } = res.data.body;

    // 渲染地图
    this.renderMap(community, coord);
  }

  // 1. 渲染地图
  renderMap(community, coord) {
    const { latitude, longitude } = coord;

    const map = new BMap.Map("map");
    const point = new BMap.Point(longitude, latitude);
    map.centerAndZoom(point, 17);
    // 位置
    const label = new BMap.Label("", {
      position: point,
      offset: new BMap.Size(0, -36)
    });
    // 样式, 内容
    label.setStyle(labelStyle);
    label.setContent(`  
      <span>${community}</span>
      <div class="${styles.mapArrow}"></div>
    `);
    map.addOverlay(label);
  }

  // 3. 渲染轮播图
  renderSwipers() {
    const {
      houseInfo: { houseImg }
    } = this.state;

    return houseImg.map(item => (
      <a key={item} href="http://itcast.cn">
        <img src={BASE_URL + item} alt="" />
      </a>
    ));
  }

  // 4. 渲染标签
  renderTags() {
    const {
      houseInfo: { tags }
    } = this.state;

    return tags.map((item, index) => {
      // 如果标签数量超过3个，后面的标签就都展示位第三个标签的样式
      let tagClass = "";
      if (index > 2) {
        tagClass = "tag3";
      } else {
        tagClass = "tag" + (index + 1);
      }

      return (
        <span key={item} className={[styles.tag, styles[tagClass]].join(" ")}>
          {item}
        </span>
      );
    });
  }

  // 6. 收藏
  handleFavorite = async () => {
    // 1. isAuth 判断是否登录
    // 2. 未登录: Modal.alert 提示用户是否登录
    // 3. 通过isFavorite判断 收藏状态
    // 4. 删除收藏 / 收藏
    const {history, location} = this.props
    if (!isAuth()) {
      return Modal.alert("提示", "登录后才能收藏房源,是否去登录", [
        { text: "取消" },
        { text: "登录", onPress: () => {
          history.push('/login', {
            from: location    //传递额外参数
          })
        }}
      ]);
    }

    // 已登录, 判断是否收藏
    if (this.state.isFavorite) {
      // 已收藏
      const res = await API.delete(`/user/favorites/${this.id}`)
      const { status } = res.data
      if (status === 200) {
        Toast.info('已取消收藏', 2)
        // 删除收藏成功
        this.setState({
          isFavorite: false
        })
      } else {
        // token 失效
        Modal.alert('提示', '登录超时，是否重新登录？', [
          { text: '取消' },
          { text: '去登录', onPress: () => {
              history.push('/login', {
                from: location  // 第二个参数：表示路由状态对象，用来给路由添加一些额外信息
              })
          } }
        ])
        this.setState({
          isFavorite: false
        })
      }
    } else {
      // 未收藏
      const res = await API.post(`/user/favorites/${this.id}`)
      const { status } = res.data
      if (status === 200) {
        Toast.info('已收藏', 1)
        this.setState({
          isFavorite: true
        })
      } else {
        Modal.alert('提示', '登录超时，是否重新登录？', [
          { text: '取消' },
          { text: '去登录', onPress: () => {
              history.push('/login', {
                from: location
              })
          } }
        ])
        this.setState({
          isFavorite: false
        })
      }
    }
  }

  render() {
    const {
      isLoading,
      houseInfo: {
        community,
        title,
        price,
        roomType,
        size,
        floor,
        oriented,
        supporting,
        description
      },
      isFavorite
    } = this.state;
    return (
      <div className={styles.root}>
        {/* 头部 */}
        <NavHeader
          className={styles.detailHeader}
          rightContent={[<i key="share" className="iconfont icon-share"></i>]}
        >
          {community}
        </NavHeader>

        {/* 轮播图 */}
        <div className={styles.slides}>
          {!isLoading ? (
            <Carousel autoplay infinite autoplayInterval={5000}>
              {this.renderSwipers()}
            </Carousel>
          ) : (
            ""
          )}
        </div>

        {/* 房屋基础信息 */}
        <div className={styles.info}>
          <h3 className={styles.infoTitle}>{title}</h3>
          <Flex className={styles.tags}>
            <Flex.Item>{this.renderTags()}</Flex.Item>
          </Flex>

          <Flex className={styles.infoPrice}>
            <Flex.Item className={styles.infoPriceItem}>
              <div>
                {price}
                <span className={styles.month}>/月</span>
              </div>
              <div>租金</div>
            </Flex.Item>
            <Flex.Item className={styles.infoPriceItem}>
              <div>{roomType}</div>
              <div>房型</div>
            </Flex.Item>
            <Flex.Item className={styles.infoPriceItem}>
              <div>{size}平米</div>
              <div>面积</div>
            </Flex.Item>
          </Flex>

          <Flex className={styles.infoBasic} align="start">
            <Flex.Item>
              <div>
                <span className={styles.title}>装修：</span>
                精装
              </div>
              <div>
                <span className={styles.title}>楼层：</span>
                {floor}
              </div>
            </Flex.Item>
            <Flex.Item>
              <div>
                <span className={styles.title}>朝向：</span>
                {oriented.join("、")}
              </div>
              <div>
                <span className={styles.title}>类型：</span>普通住宅
              </div>
            </Flex.Item>
          </Flex>
        </div>

        {/* 地理位置 */}
        <div className={styles.map}>
          <div className={styles.mapTitle}>
            小区：<span>{community}</span>
          </div>
          <div className={styles.mapContainer} id="map">
            地图
          </div>
        </div>

        {/* 房屋配套 */}
        <div className={styles.about}>
          <div className={styles.houseTitle}>房屋配套</div>
          {supporting.length === 0 ? (
            <div className={styles.titleEmpty}>暂无数据</div>
          ) : (
            <HousePackage list={supporting} />
          )}
        </div>

        {/* 房屋概况 */}
        <div className={styles.set}>
          <div className={styles.houseTitle}>房源概况</div>
          <div>
            <div className={styles.contact}>
              <div className={styles.user}>
                <img src={BASE_URL + "/img/avatar.png"} alt="头像" />
                <div className={styles.useInfo}>
                  <div>王女士</div>
                  <div className={styles.userAuth}>
                    <i className="iconfont icon-auth" />
                    已认证房主
                  </div>
                </div>
              </div>
              <span className={styles.userMsg}>发消息</span>
            </div>

            <div className={styles.descText}>
              {description || "暂无房屋描述"}
            </div>
          </div>
        </div>

        {/* 推荐 */}
        <div className={styles.recommend}>
          <div className={styles.houseTitle}>猜你喜欢</div>
          <div className={styles.items}>
            {recommendHouses.map(item => (
              <HouseItem {...item} key={item.id} onClick={a => a} />
            ))}
          </div>
        </div>

        {/* 底部收藏按钮 */}
        <Flex className={styles.fixedBottom}>
          <Flex.Item onClick={this.handleFavorite}>
          { isFavorite ? (
            <>
              <img
                src={BASE_URL + "/img/star.png"}
                className={styles.favoriteImg}
                alt="收藏"
              />
              <span className={styles.favorite}>已收藏</span>
            </>
          ) : (
            <>
              <img
                src={BASE_URL + "/img/unstar.png"}
                className={styles.favoriteImg}
                alt="收藏"
              />
              <span className={styles.favorite}>收藏</span>
            </>
          )}
          </Flex.Item>
          <Flex.Item>在线咨询</Flex.Item>
          <Flex.Item>
            <a href="tel:400-618-4000" className={styles.telephone}>
              电话预约
            </a>
          </Flex.Item>
        </Flex>
      </div>
    );
  }
}
