import { useStorage } from '@vueuse/core'
import Cookies from 'js-cookie'

// 项目配置
const keyPrefix = 'yixiu_'
const tokenKey = `${keyPrefix}token`

const tokenStorage = useStorage(tokenKey, null)

export const getToken = () => tokenStorage.value

export function setToken(access_token) {
  console.log('设置token:', access_token)
  tokenStorage.value = access_token
}

export const removeToken = () => (tokenStorage.value = null)

export function getCookie(key) {
  return Cookies.get(`${keyPrefix}${key}`)
}

export function setCookie(key, value) {
  Cookies.set(`${keyPrefix}${key}`, value, { expires: 30 })
}

export function removeCookie(key) {
  return Cookies.remove(`${keyPrefix}${key}`)
}
