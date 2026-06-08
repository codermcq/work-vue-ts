import request from './request'
import type { ApiResponse, LoginRequest, UserInfo } from '@/types'

export function login(data: LoginRequest): Promise<ApiResponse<UserInfo>> {
  return request.post('/api/login', data)
}
