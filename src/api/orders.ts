import request from './request'
import type { ApiResponse, OrderListResponse, PageParams } from '@/types'

export function getOrders(params: PageParams): Promise<ApiResponse<OrderListResponse>> {
  return request.get('/api/orders', { params })
}

export function deleteOrder(id: string): Promise<ApiResponse<null>> {
  return request.delete(`/api/orders/${id}`)
}
