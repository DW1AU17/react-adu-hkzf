import axios from 'axios'
import { BASE_URL } from './url'
import { getToken, removeToken } from './token';

// 创建axios实例 ，配置默认的url地址 （axios官网）
const API = axios.create({
  baseURL: BASE_URL
})

// 在api.js中, 添加请求拦截器
// 1. 获取当前请求接口路径
// 2. 判断接口路劲是否以 /user 开头, 并且不是登录或注册接口 (只给需要的接口添加token)
// 3. 判断返回值的状态码, 400则说明token 超时 或 异常 , 移除token

// 添加请求拦截器
API.interceptors.request.use(config => {
  // 1. 在config中获取 url 地址
  const { url } = config
  // 登录接口地址 /user/login 
  // 注册接口地址 /user/registered?redirectUrl=/rent/add
  // 排除以上两个, 路由后可能还跟着别的参数
  if (url.startsWith('/user') && !url.startsWith('/user/registered') && !url.startsWith('/user/login')) {
    // 以/user开头并且 不含后两个
    config.headers.authorization = getToken()
    // API.get("/xxx",{headers: {authorization: getToken()}})
  }
  // 返回config , 否则报错
  return config
})

// 添加响应拦截器
API.interceptors.response.use(res => {
  // 400 则移除token
  if (res.data.status === 400) {
    removeToken()
  }

  return res
})



export { API }

