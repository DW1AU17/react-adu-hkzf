import React, { Component } from 'react'

import FilterFooter from '../FilterFooter'

import styles from './index.module.css'

export default class FilterMore extends Component {
  // 选中筛选值得数据
  state = {
    selectValues: this.props.defaultValue
  }

  // 渲染标签
  renderFilters(data) {
    // 高亮类名： styles.tagActive
    // return (
    //   <span className={[styles.tag, styles.tagActive].join(' ')}>东北</span>
    // )
    return data.map(item => {
      // 1. 设置默认选中
      // 1.1 获取已选择筛选值的数组
      const { selectValues } = this.state
      // 1.2 判断是否在数组中存在
      const isSelected = selectValues.indexOf(item.value) > -1
      return (
        <span 
          key={item.value}
          className={[styles.tag, isSelected ? styles.tagActive : ''].join(' ')}
          // 点击后加入一个新的选中值数组中(重置和保存)
          onClick={() => this.handleChange(item.value)}
        >{item.label}</span>
      )
    })
  }

  // 保存单项到筛选数组中
  handleChange(value) {
    // 1. 得到默认选中的数组
    const { selectValues } = this.state
    // 2. 创建一个新选中的数组, 因为可能会取消,所有暂时存放
    let newSelectValues = [...selectValues]
    // 3. 如果存在, 则冲数组中删除
    if (newSelectValues.indexOf(value) > -1) {
      newSelectValues = newSelectValues.filter(item => item !== value)
    } else {
      // 4. 否则添加
      newSelectValues.push(value)
    }
    this.setState({
      selectValues: newSelectValues
    })
  }

  render() {
    // 父组件传递的data解构
    const { data:{roomType, oriented, floor, characteristic}, onSave, onCancel, type} = this.props
    const { selectValues } = this.state
    return (
      <div className={styles.root}>
        {/* 遮罩层 */}
        <div className={styles.mask} onClick={() => onCancel(type)}/>

        {/* 条件内容 */}
        <div className={styles.tags}>
          <dl className={styles.dl}>
            <dt className={styles.dt}>户型</dt>
            <dd className={styles.dd}>{this.renderFilters(roomType)}</dd>

            <dt className={styles.dt}>朝向</dt>
            <dd className={styles.dd}>{this.renderFilters(oriented)}</dd>

            <dt className={styles.dt}>楼层</dt>
            <dd className={styles.dd}>{this.renderFilters(floor)}</dd>

            <dt className={styles.dt}>房屋亮点</dt>
            <dd className={styles.dd}>{this.renderFilters(characteristic)}</dd>
          </dl>
        </div>

        {/* 底部按钮 */}
        <FilterFooter 
          className={styles.footer} 
          cancelText="重置"
          onCancel={() => this.setState({selectValues:[]})}  //重置
          onSave={() => onSave(type, selectValues)}
        />
      </div>
    )
  }
}
