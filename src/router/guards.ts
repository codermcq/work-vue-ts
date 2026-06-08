import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function setupGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore()

    // 已登录访问 /login → 重定向到 /dashboard
    if (to.path === '/login' && authStore.isLoggedIn) {
      return next('/dashboard')
    }

    // 未登录访问需要认证的页面 → 重定向到 /login
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      return next('/login')
    }

    next()
  })
}
