import { http } from '@/http/http'
// 资料上新
export function recentlyUpdatedApi() {
  return http.get('/kx_war/archive/recentlyUpdated')
}

// 常见故障
export function commonFaultsApi(logIds = '') {
  return http.get(`/kx_war/archive/commonFaults${logIds}`)
}
