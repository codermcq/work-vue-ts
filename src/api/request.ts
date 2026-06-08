import axios from 'axios'
import type { ApiResponse } from '@/types'

const request = axios.create({
  baseURL: '/',
  timeout: 10000,
})

// 响应拦截器：统一解包 data
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const msg = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(msg))
  },
)

export default request
