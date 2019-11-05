/* 
  条件筛选栏 - 父组件
*/
import React, { Component } from 'react'

// 设置遮罩层效果， 引入spring动画酷=库组件 
import { Spring } from 'react-spring/renderprops'

import FilterTitle from '../FilterTitle'
import FilterPicker from '../FilterPicker'
import FilterMore from '../FilterMore'

import { getCurrentCity, API } from '../../../../utils'

import styles from './index.module.css'

// 声明一组四个title的高亮状态
const titleSelectedStatus = {
  area: false,
  mode: false,
  price: false,
  more: false
}

// 选中值得对象, 用来设置每一次的选中值(现在为默认都不选中的默认值)
const selectedValues = {
  area: ['area', 'null'],
  mode: ['null'],
  price: ['null'],
  more: []
}

export default class Filter extends Component {
  state = {
    titleSelectedStatus,
    openType: '', // 打开的筛选类型
    selectedValues,
    filtersData: {}  // 所有筛选条件的数据
  }

  componentDidMount() {
    this.getFilterData()
  }

  // 1. 获取所有筛选条件数据
  async getFilterData() {
    // 1.1 根据当前定位城市id
    const { value } = await getCurrentCity()

    const res = await API.get('/houses/condition',{params:{id:value}})
    this.setState({
      filtersData: res.data.body
    })

  }

  // 点击title, 高亮当前项 (传入当前项的类型)
  changeTitleSelected = type => {
    /*
      bug: 直接点击切换title, 默认值不会赋值
      原因: react使用虚拟DOM和Diff算法实现部分更新, 通过对比更细前后的两个虚拟DOM找差异,最后只讲差异的地方渲染在页面
      解决: 使用key属性, 对比key相同则复用, 不同则重新渲染
    */ 

    /* 1. 获取两个状态, 标题选中状态对象 和 筛选条件默认选中值对象
     *    点击时需要判断别的项有没有被选中
     */ 
    const { titleSelectedStatus, selectedValues } = this.state
    // 2. 创建一个新状态title选中对象; 根据点击的当前title, 得到一个新的标题选中状态对象(new)
    const newTitleSelectedStatus = {...titleSelectedStatus}  // 可以修改, 因为地址不变, 改的是内容
    // 3. 通过Object.keys() , 遍历标题选中状态对象
    Object.keys(titleSelectedStatus).forEach(item => {
      // 3.5 获取当前title的筛选对象的值
      const selectedVal = selectedValues[item]
      // 4. 如果为当前项, 直接为true
      if (item === type) {
        newTitleSelectedStatus[item] = true
      }else {
        // 5. 否则, 分别判断选中值是否和默认选中值对象中对应的项相同 / 创建一个对比函数
        // 6. 相同, 选中状态为false
        // 7. 不同, 选中状态为true
        const dealSelected = this.getTitleSelectedStatus(item, selectedVal)
        // 8. 得到一个新的title选中对象Object.assign   /合并覆盖 (后者,覆盖前者)
        //    在原有的基础上,合并到 newTitleSelectedStatus 中
        Object.assign(newTitleSelectedStatus, dealSelected)
      }
    })
    this.setState({
      titleSelectedStatus: newTitleSelectedStatus,
      openType: type
    })
  }

  // 判断title组件,每一项的筛选和默认数据的对比
  getTitleSelectedStatus(type, selectedVal) {
    // 声明一个新的待返回的title 选中对象
    const newTitleSelectedStatusItem = {}
    // 和默认数据进行比较
    // 只要有选择就会有三项， 地铁默认不选也算选中
    if (type === 'area' && (selectedVal.length === 3 || selectedVal[0] === 'subway')) {
      newTitleSelectedStatusItem[type] = true
    } else if (type === 'mode' && selectedVal[0] !== 'null') {
      newTitleSelectedStatusItem[type] = true
    } else if (type === 'price' && selectedVal[0] !== 'null') {
      newTitleSelectedStatusItem[type] = true
    } else if (type === 'more' && selectedVal.length > 0) {
      newTitleSelectedStatusItem[type] = true
    } else {
      newTitleSelectedStatusItem[type] = false  
    }
    // 返回当前项处理后的对象 如: {area: true}
    return newTitleSelectedStatusItem
  }

  // footer组件的取消
  onCancel = type => {
    // 判断当期title有没有被选中的picker
    // 获取 两个状态 / 当前项的选中对象
    const { titleSelectedStatus, selectedValues } = this.state  
    const currentSelect = selectedValues[type]
    // 和默认值进行判断
    const dealSelected = this.getTitleSelectedStatus(type, currentSelect)
    // Object.assign(titleSelectedStatus, dealSelected)
    // {...titleSelectedStatus, ...dealSelected}       和上面效果一样
    this.setState({
      titleSelectedStatus: {...titleSelectedStatus, ...dealSelected},
      openType: ''
    })
  }
  // footer组件的保存
  onSave = (type, value) => {
    // 1. 获取当前title类型的选中值
    const { titleSelectedStatus, selectedValues } = this.state
    // 2. 得到最新的筛选状态对象
    const dealSelected = this.getTitleSelectedStatus(type, value)
    // 3. 得到最新的筛选条件对象
    const newSelectedValues = {
      ...selectedValues,
      [type]: value     // 最新的筛选项的值val  ===> [area,..,..] 每一项的状态
    }

    // 4. 组合筛选条件 filter对象, 用于筛选展示的房源列表 
    //    根据最后一个value值 , 列入: 
    // {
    //   area: 'AREA|67fad918-f2f8-59df', 或 subway: '...'
    //   mode: 'true', 或 'null'
    //   price: 'PRICE|2000',
    //   more: 'ORIEN|80795f1a-e32f-feb9,ROOM|d4a692e4-a177-37fd'
    // }
    // 4.1 传递给父组件的筛选条件对象
    const filter = {}
    // 4.2 处理每一项 (筛选条件只需要最后一个value, area中比较特殊有三项, )
    const area = newSelectedValues.area  // arr
    if (area.length === 2) {
      filter[area[0]] = "null"  // ['area','null']
    }else if (area.length === 3) {
      filter[area[0]] = area[2] === 'null' ? area[1] : area[2]  // ['area','AREA|67fad918-f2f8-59df','null']  ： ['area','AREA|67fad918-f2f8-59df','AREA|67fad918-f2f8-59df] 
    }
    filter.mode = newSelectedValues.mode[0]
    filter.price = newSelectedValues.price[0]
    filter.more = newSelectedValues.more.join(',')   // more每一项通过 ，逗号分割
    // 4.3 传给父组件方法
    this.props.onFilter(filter)

    // 5. 更新state中数据
    this.setState({
      openType: '',
      titleSelectedStatus: {...titleSelectedStatus, ...dealSelected},
      selectedValues: newSelectedValues
    })
  }

  // 渲染picker(选择器)组件
  renderFilterPicker() {
    const {
      openType,
      filtersData: {area, subway, rentType, price},
      selectedValues
    } = this.state

    if (openType === 'more' || openType === '') return null

    let data
    let cols = 1
    let defaultValue = selectedValues[openType]  // 记录默认选中值

    // area: area => {}, subway => {}
    // mode: rentType => []
    // price: price => []
    switch (openType) {
      case 'area':
        data = [area, subway]
        cols = 3
        break
      case 'mode':
        data = rentType
        break
      case 'price':
        data = price
        break
      default:
        break
    }

    return (
      <FilterPicker 
        key={openType}
        onSave={this.onSave} 
        onCancel={this.onCancel}
        data={data}
        cols={cols}
        type={openType}
        defaultValue={defaultValue}
      />
    )
  }

  // 渲染more组件
  renderFilterMore() {
    // 获取类型, 和需要的筛序数据(四层)
    const {openType, filtersData:{ roomType, oriented, floor, characteristic },selectedValues } = this.state
    // more组件中的默认值
    const defaultValue = selectedValues.more
    // 如果类型不是默认 直接返回null
    if (openType !== 'more') return null
    const data = { roomType, oriented, floor, characteristic}
    return (
      // 传递给子组件 more
      <FilterMore data={data} onSave={this.onSave} onCancel={this.onCancel} defaultValue={defaultValue} type={openType}/>
    )
  }

  // 渲染zhezhaoc
  renderMask() {
    const { openType } = this.state
    const isHide = openType === 'more' || openType === ''
    // if (isHide) return null
    // 注意：要实现隐藏时的动画效果，一定要保证 组件 是存在的，否则，如果 组件 都不存在
    // 那么，一定无法实现动画效果
    return (
      // <Spring from={{opacity: 0}} to={{ opacity: 1}}>
      <Spring to={{ opacity: isHide ? 0 : 1}}>
        {props => {
          // props 实际就是当前动画从 0 到 1 的状态
          if (props.opacity === 0) {
            return null
          }
          return (
            <div 
              style={props}
              className={styles.mask}
              onClick={() => this.onCancel(openType)}
            />
          )
        }}
      </Spring>
    )
  }

  render() {
    const {titleSelectedStatus} = this.state
    return (
      <div className={styles.root}>
        {/* 前三个菜单的遮罩层 */}
        {this.renderMask()}
        
        <div className={styles.content}>
          {/* 标题栏 */}
          <FilterTitle 
            titleSelectedStatus={titleSelectedStatus}
            onClick={this.changeTitleSelected}
          />

          {/* 前三个菜单对应的内容： */}
          {/* {openType === '' ? null : <FilterPicker onSave={this.onSave} onCancel={this.onCancel}/>} */}
          {this.renderFilterPicker()}

          {/* 最后一个菜单对应的内容： */}
          {this.renderFilterMore()}
        </div>
      </div>
    )
  }
}
