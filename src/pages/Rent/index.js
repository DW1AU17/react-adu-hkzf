import React, { Component } from "react"

import { Link } from "react-router-dom"

import Navheader from "../../components/NavHeader"
import Nohouse from "../../components/NoHouse"

import styles from "./index.module.css"
import HouseItem from "../../components/HouseItem";
import { BASE_URL, API } from "../../utils";

// 去出租页面
export default class Rend extends Component {
  state = {
    list: [],    // 出租房屋列表
    isFirst: true    // 解决刷新时, 一闪的bug
  }
  componentDidMount() {
    // 得到房源数据
    this.getHouseList()
  }

  // 得到房源数据
  async getHouseList() {
    const res = await API.get('/user/houses')
    
    const { status, body } = res.data
    if (status === 200) {
      this.setState({
        list: body,
        isFirst: false
      })
    } else {
      // 转登录页
      const { history, location } = this.props
      history.replace('/login', {
        from: location
      })
    }
  }

  // 渲染房源列表
  renderRentList() {
    const { list, isFirst} = this.state
    const hasHouses = list.length > 0
    if ( hasHouses || isFirst) {
      return <div className={styles.houses}>{this.renderHouseItem()}</div>
    } else {
      return (
        <Nohouse>
          <>
            您还没有房源，
            <Link to="/rent/add" className={styles.link}>
              去发布房源
            </Link>
            吧~
          </>
        </Nohouse>
      )
    }
  }

  // 有数据时的房源列表
  renderHouseItem() {
    const { list } = this.state
    const { history } = this.props

    return list.map(item => {
      return (
        <HouseItem 
          key={item.houseCode}
          onClick={() => history.push(`/detail/${item.houseCode}`)}
          {...item}
          houseImg={BASE_URL + item.houseImg}
        />
      )
    })
  }

  render () {
    const { history } = this.props
    return (
      <div className={styles.root}>
        {/* 头部 */}
        <Navheader
          className={styles.rentHeader}
          onLeftClick={() => history.go(-1)}
        >
          房屋管理
        </Navheader>

        {/* 已发布的房源列表 */}
        {this.renderRentList()}

      </div>
    )
  }
}