  // Vercel serverless catch-all — 处理所有 /api/* 请求
// 文件名: api/[...route].js (使用 .js 避免 Vercel 编译问题)

const orders = [
  { id: '001', project: 'Road Project A',       overtime: true,  hours: 3.5, created_at: '2024-04-10 10:30' },
  { id: '002', project: 'Bridge Maintenance B',  overtime: false, hours: 2,   created_at: '2024-04-09 13:00' },
  { id: '003', project: 'Pipeline Fix C',        overtime: true,  hours: 4.5, created_at: '2024-04-08 08:00' },
  { id: '004', project: 'Bridge Maintenance B',  overtime: true,  hours: 3,   created_at: '2024-04-07 16:45' },
  { id: '005', project: 'Tunnel Cleaning D',     overtime: false, hours: 8.1, created_at: '2024-04-03 11:43' },
]

function json(res, code, message, data = null) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ code, message, data }))
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => resolve(body))
  })
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  // 获取路径：Vercel 中 req.url 可能是 /api/xxx 或 /xxx，统一 strip /api
  let path = (req.url || '/').split('?')[0]
  if (path.startsWith('/api')) {
    path = path.slice(4) || '/'
  }
  const method = (req.method || 'GET').toUpperCase()

  try {
    // POST /login
    if (method === 'POST' && (path === '/login' || path === '/api/login')) {
      const raw = await readBody(req)
      const { username } = JSON.parse(raw || '{}')
      const role = username === 'admin' ? 'admin' : 'user'
      return json(res, 0, 'ok', { username, role })
    }

    // DELETE /orders/:id
    const deleteMatch = path.match(/^\/orders\/([^/]+)$/)
    if (method === 'DELETE' && deleteMatch) {
      const id = deleteMatch[1]
      const index = orders.findIndex(o => o.id === id)
      if (index !== -1) {
        orders.splice(index, 1)
        return json(res, 0, 'ok', null)
      }
      return json(res, 404, '工单不存在', null)
    }

    // GET /orders 或 /orders?page=X&pageSize=Y
    if (method === 'GET' && (path === '/orders' || path.startsWith('/orders?'))) {
      const queryString = (req.url || '').split('?')[1] || ''
      const params = {}
      queryString.split('&').forEach(pair => {
        const [k, v] = pair.split('=')
        if (k) params[k] = decodeURIComponent(v || '')
      })
      const page = parseInt(params.page) || 1
      const pageSize = parseInt(params.pageSize) || orders.length
      const total = orders.length
      const start = (page - 1) * pageSize
      const list = orders.slice(start, start + pageSize)
      return json(res, 0, 'ok', { list, total, page, pageSize })
    }

    return json(res, 404, `接口不存在: ${method} ${path}`, null)
  } catch (err) {
    return json(res, 500, '服务器错误', null)
  }
}
