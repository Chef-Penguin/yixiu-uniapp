import { http } from '@/http/http'
// 获取验证码
export function getVcodeApi(params) {
  return http.get('/kx_war/login/vcode', params)
}
// 登录
export function loginApi(data) {
  return http.post('/kx_war/login', data)
}

// 上传图片

export function sendPictureApi(data) {
  return http.post('/kx_war/login/upload/picture', data)
}

export function getRoleLevelListApi() {
  return http.get('/kx_war/login/load/wd')
}

export function getUserInfo() {
  return http.get('/kx_war/login/user/info')
}

export function getProjectCodeApi(params) {
  return http.get('/kx_war/login/area/code', params)
}

export function sendUserInfoApi(data) {
  return http.post('/kx_war/login/user/update', data)
}

// 支付宝
export function getAlipay(data) {
  return http.post('/kx_war/alipay/pay', data)
}
// 退出登录
export function logoutApi() {
  return http.post('/kx_war/logout')
}
