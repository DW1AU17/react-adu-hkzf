import React from "react";

import { Flex } from "antd-mobile";

import { withRouter } from "react-router-dom";

import styles from './index.module.scss';

// 通过withRouter， 从props中得到history （解构 
// 这边要接受传递过来的 className 否则不会生效
function SearchHeader({history, cityName, className}) {
  return (
    <Flex className={[styles.root, className].join(' ')}>
      <Flex className={styles.searchLeft}>
        <div
          className={styles.location}
          onClick={() => history.push("/citylist")}
        >
          <span>{cityName}</span>
          <i className="iconfont icon-arrow" />
        </div>
        <div
          className={styles.searchForm}
          onClick={() => history.push("/rent/search")}
        >
          <i className="iconfont icon-seach" />
          <span>请输入小区或地址</span>
        </div>
      </Flex>
      <i
        className="iconfont icon-map"
        onClick={() => history.push("/map")}
      />
    </Flex>
  );
}

export default withRouter(SearchHeader)