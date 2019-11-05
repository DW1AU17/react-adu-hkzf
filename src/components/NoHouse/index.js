import React from 'react'

import { BASE_URL } from '../../utils/url'

import styles from './index.module.scss'

const NoHouse = ({children}) => (   // () 代替 {} 可省略return ()
  <div className={styles.root}>
    {/* 图片的获取方式？？？？为啥是/img/ */}
    <img className={styles.img} src={BASE_URL + '/img/not-found.png'} alt=""/>
    <p className={styles.msg}>{children}</p>
  </div>
)

export default NoHouse