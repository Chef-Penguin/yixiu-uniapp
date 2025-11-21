/**
 * 环境变量统一配置
 * 提供类型安全的环境变量访问
 */

// API 基础地址（用于接口请求）
export const SERVER_BASEURL = import.meta.env.VITE_SERVER_BASEURL

// 服务器地址（用于资源访问，如图片等）
export const SERVER = import.meta.env.VITE_SERVER || import.meta.env.VITE_SERVER_BASEURL

// 备用服务器地址
export const SERVER_BASEURL_SECONDARY = import.meta.env.VITE_SERVER_BASEURL_SECONDARY

// 代理配置
export const PROXY_ENABLE = JSON.parse(import.meta.env.VITE_APP_PROXY_ENABLE || 'false')
export const PROXY_PREFIX = import.meta.env.VITE_APP_PROXY_PREFIX

// 认证模式
export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE

// 应用配置
export const APP_TITLE = import.meta.env.VITE_APP_TITLE
export const APP_PORT = import.meta.env.VITE_APP_PORT
