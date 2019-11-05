import React, { Component } from 'react'

import { PickerView } from 'antd-mobile'

import FilterFooter from '../FilterFooter'

export default class FilterPicker extends Component {
  state = {
    value: this.props.defaultValue    // 记录已经选择的单项值
  }

  // picker组件滚动后触发
  onChange = val => {
    this.setState({
      value: val
    })
  }

  render() {
    const { onSave, onCancel, cols, type, data } =this.props
    const { value } = this.state
    return (
      <>
        {/* 选择器组件： */}
        <PickerView 
          data={data} 
          // 设置默认选中
          value={value} 
          cols={cols} 
          onChange={this.onChange}
        />
        {/* 底部按钮 */}
        <FilterFooter onSave={() => onSave(type, value)} onCancel={() => onCancel(type)}/>
      </>
    )
  }
}
