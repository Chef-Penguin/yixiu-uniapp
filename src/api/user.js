import { http } from '@/http/http'
// 获取验证码
export function getVcodeApi(params) {
  return http.get('/login/vcode', params)
}
// 登录
export function loginApi(data) {
  return http.post('/login', data)
}

// 上传图片

export function sendPictureApi(data) {
  return http.post('/login/upload/picture', data)
}

export function getRoleLevelListApi() {
  return http.get('/login/load/wd')
}

export function getUserInfo() {
  return http.get('/login/user/info')
}

export function getProjectCodeApi(params) {
  return http.get('/login/area/code', params)
}

export function sendUserInfoApi(data) {
  return http.post('/login/user/update', data)
}

// 支付宝
export function getAlipay(data) {
  return http.post('/alipay/pay', data)
}
// 退出登录
export function logoutApi() {
  return http.post('/logout')
}
