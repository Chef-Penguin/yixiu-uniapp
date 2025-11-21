import { http } from '@/http/http'

// 记日志查询
export function getQueryLog(params) {
  return http.get('/kx_war/log/queryLog', params)
}

// 更新日志
export function getUpdateChatLog(data) {
  return http.put('/kx_war/log/updateChatLog', data)
}
// 获取日志详情
export function getLog(id) {
  return http.get(`/kx_war/log/${id}`)
}
// 关联对话
export function getRelatedLog(params) {
  return http.get('/kx_war/log/related', params)
}
// 获取修车次数
export function getCarCount() {
  return http.get('/kx_war/log/getRepairCountAndDay')
}
