import React from 'react'

import { Flex } from 'antd-mobile'

import styles from './index.module.css'

// 条件筛选栏标题数组：
const titleList = [
  { title: '区域', type: 'area' },
  { title: '方式', type: 'mode' },
  { title: '租金', type: 'price' },
  { title: '筛选', type: 'more' }
]

export default function FilterTitle({onClick, titleSelectedStatus}) {
  // 高亮状态由父组件控制
  return (
    <Flex align="center" className={styles.root}>
      {titleList.map(item => {
        const isSelected = titleSelectedStatus[item.type]  // 获取高亮数组中对应项的值 
        return (
          // 点击高亮, 在父组件中控制
          <Flex.Item key={item.type} onClick={() => onClick(item.type)}>
            {/* 选中类名： selected / 当前高亮 */}
            <span className={[styles.dropdown, isSelected ? styles.selected : ''].join(' ')}>
              <span>{item.title}</span>
              <i className="iconfont icon-arrow" />
            </span>
          </Flex.Item>
        )
      })}
    </Flex>
  )
}
