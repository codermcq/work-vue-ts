import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { login as loginApi } from '@/api/auth'

const SESSION_KEY = 'work-order-user'

export const useAuthStore = defineStore('auth', () => {
  // 从 sessionStorage 恢复用户
  const saved = sessionStorage.getItem(SESSION_KEY)
  const user = ref<UserInfo | null>(saved ? JSON.parse(saved) : null)

  const isLoggedIn = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(username: string, password: string) {
    const res = await loginApi({ username, password })
    if (res.code !== 0) {
      throw new Error(res.message || '登录失败')
    }
    user.value = res.data
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(res.data))
  }

  function logout() {
    user.value = null
    sessionStorage.removeItem(SESSION_KEY)
  }

  return { user, isLoggedIn, isAdmin, login, logout }
})
