/** 工单数据 */
export interface WorkOrder {
  id: string
  project: string
  overtime: boolean
  hours: number
  created_at: string
}

/** 统一 API 响应 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/** 分页查询参数 */
export interface PageParams {
  page: number
  pageSize: number
}

/** 工单分页响应 */
export interface OrderListResponse {
  list: WorkOrder[]
  total: number
  page: number
  pageSize: number
}

/** 登录请求 */
export interface LoginRequest {
  username: string
  password: string
}

/** 用户信息 */
export interface UserInfo {
  username: string
  role: 'admin' | 'user'
}
