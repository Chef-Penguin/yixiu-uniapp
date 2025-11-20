import { http } from '@/http/http'
// 拍照
export function sendimgOcrApi(data) {
  return http.post('/chat/image/ocr', data)
}
