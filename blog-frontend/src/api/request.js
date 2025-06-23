import axios from 'axios'
import { ElMessage } from "element-plus";

const request = axios.create({
  baseURL: 'http://localhost:5000/api', // 代理到后端
  timeout: 15000
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

// 响应拦截器
request.interceptors.response.use(
    (res) => res.data,
    (err) => {
        const { response } = err;
        const code = response?.data?.code;

        if (response?.status === 401) {
            if (code === 40101) {
                ElMessage.warning("请先进行登录");
                localStorage.removeItem("token");
            } else if (code === 40102) {
                ElMessage.error("身份验证失败，请重新登录");
                localStorage.removeItem("token");
            } else {
                ElMessage.warning(response.data.message || "身份验证失败");
            }
        } else if (response?.status === 403) {
            ElMessage.warning("权限不足");
        } else {
            ElMessage.error(response?.data?.message || "请求失败");
        }

        return Promise.reject(err);
    }
);

export default request
