import React from 'react'

import { Flex } from 'antd-mobile'

import styles from './index.module.css'

function FilterFooter({
  cancelText = '取消',
  okText = '确定',
  className,
  style,
  onSave,
  onCancel
}) {
  return (
    <Flex style={style} className={[styles.root, className || ''].join(' ')}>
      {/* 取消按钮 */}
      <span 
        className={[styles.btn, styles.cancel].join(' ')}
        onClick={onCancel}
      >
        {cancelText}
      </span>

      {/* 确定按钮 */}
      <span 
        className={[styles.btn, styles.ok].join(' ')} 
        onClick={onSave}
      >
        {okText}
      </span>
    </Flex>
  )
}

export default FilterFooter
