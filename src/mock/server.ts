import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

/** 初始工单数据 */
const initialOrders = [
  { id: '001', project: 'Road Project A',       overtime: true,  hours: 3.5, created_at: '2024-04-10 10:30' },
  { id: '002', project: 'Bridge Maintenance B',  overtime: false, hours: 2,   created_at: '2024-04-09 13:00' },
  { id: '003', project: 'Pipeline Fix C',        overtime: true,  hours: 4.5, created_at: '2024-04-08 08:00' },
  { id: '004', project: 'Bridge Maintenance B',  overtime: true,  hours: 3,   created_at: '2024-04-07 16:45' },
  { id: '005', project: 'Tunnel Cleaning D',     overtime: false, hours: 8.1, created_at: '2024-04-03 11:43' },
]

/** 内存中的工单数组（可变） */
let orders = [...initialOrders]

/** 统一响应 */
function json(res: ServerResponse, code: number, message: string, data: unknown = null) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ code, message, data }))
}

/** 设置 CORS 头 */
function setCors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

/** 解析 JSON body */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: string) => { body += chunk })
    req.on('end', () => resolve(body))
  })
}

/** 解析 URL query 参数 */
function parseQuery(url: string): Record<string, string> {
  const idx = url.indexOf('?')
  if (idx === -1) return {}
  const qs = url.slice(idx + 1)
  const params: Record<string, string> = {}
  qs.split('&').forEach(pair => {
    const [k, v] = pair.split('=')
    params[k] = decodeURIComponent(v || '')
  })
  return params
}

/** 模拟 400ms 延迟 */
function delay(ms = 400): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function mockServerPlugin(): Plugin {
  return {
    name: 'mock-api-server',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url || ''
        const method = req.method?.toUpperCase() || ''

        // 仅拦截 /api 路径
        if (!url.startsWith('/api')) {
          return next()
        }

        setCors(res)

        // 处理 OPTIONS 预检请求
        if (method === 'OPTIONS') {
          res.writeHead(204)
          res.end()
          return
        }

        await delay(400)

        try {
          // POST /api/login
          if (method === 'POST' && url === '/api/login') {
            const raw = await readBody(req)
            const { username } = JSON.parse(raw || '{}')
            const role: 'admin' | 'user' = username === 'admin' ? 'admin' : 'user'
            return json(res, 0, 'ok', { username, role })
          }

          // DELETE /api/orders/:id
          const deleteMatch = url.match(/^\/api\/orders\/([^?]+)$/)
          if (method === 'DELETE' && deleteMatch) {
            const id = deleteMatch[1]
            const index = orders.findIndex(o => o.id === id)
            if (index !== -1) {
              orders.splice(index, 1)
              return json(res, 0, 'ok', null)
            }
            return json(res, 404, '工单不存在', null)
          }

          // GET /api/orders?page=X&pageSize=Y
          if (method === 'GET' && url.startsWith('/api/orders')) {
            const query = parseQuery(url)
            const page = parseInt(query.page) || 1
            const pageSize = parseInt(query.pageSize) || orders.length
            const total = orders.length
            const start = (page - 1) * pageSize
            const list = orders.slice(start, start + pageSize)
            return json(res, 0, 'ok', { list, total, page, pageSize })
          }

          // 未匹配路由
          return json(res, 404, '接口不存在', null)
        } catch (err) {
          console.error('[mock] error:', err)
          return json(res, 500, '服务器内部错误', null)
        }
      })
    },
  }
}
