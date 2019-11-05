import axios from 'axios'
// 获取当前城市方法 在多个页面中使用 单独封装成工具函数

// 盗用localstorage的方法
import { getCity, setCity } from './localstorage'

// BMap 是全局对象
const BMap = window.BMap;

// 获取当前城市信息  --> 工具
const getCurrentCity = () => {
  // 1. 判断localstorage中是否存在当前城市的数据 (有:直接返回; 没有: 接口获取)
  // 封装存取localstorage
  const curCity = getCity()
  // 2. 使用异步加载, 返回promise对象
  if (!curCity) {
    // 不存在 ,调用百度地图获取
    return new Promise(resolve => {
      const myCity = new BMap.LocalCity();
      myCity.get(async result => {
        // 1.获取当前城市的名字
        var cityName = result.name;
        // 2.根据名字获取当前城市的信息
        // const res = await axios.get(`http://localhost:8080/area/info?name=${cityName}`)    // 推荐使用下面
        const res = await axios.get("http://localhost:8080/area/info",{
          params: {name: cityName}
        })
        // 3. 把城市信息存到localstorage中,(并把城市名字存到state中)
        const { label, value } = res.data.body
        // 4. 把成功数据返回
        resolve({ label, value })
        // 5. 把当前城市信息存到localstorage中
        setCity({ label, value })
      });
    })
  }else {
    // 有, 则直接返回, 为保证返回的一直性, 这边也返回promise对象
    // 直接返回成功的
    return Promise.resolve(curCity)
  }
} 

// 肯定有多个方法, 返回一个对象 (直接把localstorage工具导出)
export { getCurrentCity, getCity, setCity}

// 直接把API 导入并导出 (这样就不需要大量引入js)
export { API } from './api'

export { BASE_URL } from './url'

export { getToken, setToken, removeToken, isAuth } from './token'
 