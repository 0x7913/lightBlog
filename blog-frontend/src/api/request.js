import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:5000/api', // 代理到后端
  timeout: 10000
})

// 请求拦截器（自动添加 Token）
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器（统一错误处理）
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API 请求错误:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)
export default request
