import { http } from '@/http/http'
// 添加书签
export function addCollection(data) {
  return http.post('/kx_war/user/create/bookmark', data)
}
// 查询书签
export function getCollectionListApi(params) {
  return http.get('/kx_war/user/query/bookmark', params)
}
// 查询书签详情
export function getCollectionDetailApi(params) {
  return http.get('/kx_war/user/detail', params)
}
