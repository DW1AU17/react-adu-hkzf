import React, { Component, createRef } from 'react'

import styles from "./index.module.scss"

// 封装一个高阶组件 (使元素具有吸顶功能)
// 1. 创建两个 ref 对象 (placeholder, content), 分别指向占位元素, 内容元素
// 2. 监听浏览器 scoll 事件 (一定要销毁事件)
// 3. 在scroll 事件中, 通过 getBoundingClientRect()  方法得到筛选栏占位元素当前的top
// 4. 判断top 是否小于 0 (不在可视区内)  大于0 ,在可视区
// 5. 小于0, 添加吸顶样式, 并设置占位元素高度
// 6. 否则,相反


class Sticky extends Component {
  // 1. 
  contentRef = createRef()       //react.createRef()
  placeholderRef = createRef()
  // 2. 监听
  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll)
  }
  //    解绑(卸载阶段)
  componentWillMount() {
    window.removeEventListener("scroll", this.handleScroll)
  }

  // 3. 
  handleScroll = () => {
    // 获取传递的高度
    const { height } = this.props 
    // 获取两个ref的dom对象
    const placeholderEle = this.placeholderRef.current
    const contentEle = this.contentRef.current
    // 通过 getBoundingClientRect() 方法获取位置 (是js原生方法)
    const { top } = placeholderEle.getBoundingClientRect()
    if (top < 0) {
      // 不在可视区内 (添加占位高度, 不然会有明显的跳动收拢效果)
      placeholderEle.style.height = `${height}px`
      contentEle.classList.add(styles.fixed)
    } else {
      placeholderEle.style.height = '0px'
      contentEle.classList.remove(styles.fixed)
    }
  }

  render() {
    return (
      <div>
        {/* 占位符 */}
        <div ref={this.placeholderRef}/>
        {/* 内容 */}
        {/* children就是要被包裹的组件 */}
        <div ref={this.contentRef}>{this.props.children}</div>
      </div>
    )
  }


}


export default Sticky