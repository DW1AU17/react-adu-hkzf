// 读取环境变量中配置的接口地址
const BASE_URL = process.env.REACT_APP_URL
// 导出 (不是默认导出 ， 导入时名字要对应，也要是BASE_URL)
export { BASE_URL }