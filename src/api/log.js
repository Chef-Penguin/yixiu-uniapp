import { http } from '@/http/http'

// 记日志查询
export function getQueryLog(params) {
  return http.get('/log/queryLog', params)
}

// 更新日志
export function getUpdateChatLog(data) {
  return http.put('/log/updateChatLog', data)
}
// 获取日志详情
export function getLog(id) {
  return http.get(`/log/${id}`)
}
// 关联对话
export function getRelatedLog(params) {
  return http.get('/log/related', params)
}
// 获取修车次数
export function getCarCount() {
  return http.get('/log/getRepairCountAndDay')
}
