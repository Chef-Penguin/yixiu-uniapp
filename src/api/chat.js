import { http } from '@/http/http'
// 发送ai对话消息
export function sendMsg(data) {
  return http.post('/chat/completions', data, {}, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer app-rEIvTTyhwhX8FBEiJy8AboRO',
    },
  })
}

// 获取手册等详情
export function getDocumentDetail(params) {
  return http.post('/document/query/by/id', {}, params)
}

// 获取手册等目录
export function getDocumentTitle(data) {
  return http.post('/chat/manual/title', data)
}

// 获取手册等内容详情
export function getDocumentContent(params) {
  return http.get('/document/query/by/id', params)
}

// 点击聊天信息获取目录
export function getChatDirectory(params) {
  return http.get('/manual/query', params)
}

// 手册详情中的目录
export function getDetailDirectory(id) {
  return http.get(`/manual/directory/${id}`)
}

// 查询汽车
export function getCarModelApi() {
  return http.get(`/chat/load/car/model`)
}
// 新增历史对话
export function getCreteChatLog(data) {
  return http.post('/log/creteChatLog', data)
}

// 获取总结日志
export function getAiSummary(data) {
  return http.post('/chat/aiSummary', data)
}

// 通过vin码查询车型
export function getVehicleModel(vinCode) {
  return http.get(`/chat/modelMatching/${vinCode}`)
}
