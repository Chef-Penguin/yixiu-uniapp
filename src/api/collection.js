import { http } from '@/http/http'
// 添加书签
export function addCollection(data) {
  return http.post('/user/create/bookmark', data)
}
// 查询书签
export function getCollectionListApi(params) {
  return http.get('/user/query/bookmark', params)
}
// 查询书签详情
export function getCollectionDetailApi(params) {
  return http.get('/user/detail', params)
}
