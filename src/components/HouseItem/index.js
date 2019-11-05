import React from "react"

import styles from "./index.module.css"

function HouseItem({style, onClick, houseImg, title, desc, tags, price }) {
  return (
    <div style={style} className={styles.house} onClick={onClick}>
        <div className={styles.imgWrap}>
          <img
            className={styles.img}
            src={houseImg}
            alt=""
          />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.desc}>{desc}</div>
          <div>
            {tags.map((tag,index) => {
              const tagNumb = `tag${index > 2 ? 3 : index + 1}`
              return (
                <span key={index} className={[styles.tag, styles[tagNumb]].join(" ")}>{tag}</span>
              )
            })}
          </div>
          <div className={styles.price}>
            <span className={styles.priceNum}>{price}</span> 元/月
          </div>
        </div>
      </div>
  )
} 

export default HouseItem