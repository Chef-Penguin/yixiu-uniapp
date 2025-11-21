import { http } from '@/http/http'
// 发送ai对话消息
export function sendMsg(data) {
  return http.post('/kx_war/chat/completions', data, {}, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer app-rEIvTTyhwhX8FBEiJy8AboRO',
    },
  })
}

// 获取手册等详情
export function getDocumentDetail(params) {
  return http.post('/kx_war/document/query/by/id', {}, params)
}

// 获取手册等目录
export function getDocumentTitle(data) {
  return http.post('/kx_war/chat/manual/title', data)
}

// 获取手册等内容详情
export function getDocumentContent(params) {
  return http.get('/kx_war/document/query/by/id', params)
}

// 点击聊天信息获取目录
export function getChatDirectory(params) {
  return http.get('/kx_war/manual/query', params)
}

// 手册详情中的目录
export function getDetailDirectory(id) {
  return http.get(`/kx_war/manual/directory/${id}`)
}

// 查询汽车
export function getCarModelApi() {
  return http.get(`/kx_war/chat/load/car/model`)
}
// 新增历史对话
export function getCreteChatLog(data) {
  return http.post('/kx_war/log/createChatLog', data)
}

// 获取总结日志
export function getAiSummary(data) {
  return http.post('/kx_war/chat/aiSummary', data)
}

// 通过vin码查询车型
export function getVehicleModel(vinCode) {
  return http.get(`/kx_war/chat/modelMatching/${vinCode}`)
}
