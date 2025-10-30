import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 600000
})
//请求拦截器
request.interceptors.request.use(
  config => {
    const loginUser = JSON.parse(localStorage.getItem('loginUser') || '{}')
    if (loginUser.token) {
      config.headers['token'] = loginUser.token
    }
    return config
  }, error => {
    return Promise.reject(error)
  })
// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  }, error => {
    if(error.response.status === 401){
      // 处理未授权的情况，例如跳转到登录页
      ElMessage.error('登录过期，请重新登录');
      // 可以添加跳转到登录页的逻辑
      router.push('/login');
    }
    return Promise.reject(error)
  })
  export default request
