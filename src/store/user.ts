import type { IUserInfoRes } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUserInfo,
} from '@/api/login'

// 初始化状态
const userInfoState: IUserInfoRes = {
  userId: -1,
  username: '',
  nickname: '',
  avatar: '/static/images/default-avatar.png',
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoRes>({ ...userInfoState })
    // 设置用户信息
    const setUserInfo = (val: IUserInfoRes) => {
      console.log('设置用户信息', val)
      // 若头像为空 则使用默认头像
      if (!val.avatar) {
        val.avatar = userInfoState.avatar
      }
      userInfo.value = val
    }
    const setUserAvatar = (avatar: string) => {
      userInfo.value.avatar = avatar
      console.log('设置用户头像', avatar)
      console.log('userInfo', userInfo.value)
    }
    // 删除用户信息
    const clearUserInfo = () => {
      userInfo.value = { ...userInfoState }
      uni.removeStorageSync('user')
    }

    /**
     * 获取用户信息
     */
    const fetchUserInfo = async () => {
      const res = await getUserInfo()
      setUserInfo(res)
      return res
    }

    return {
      userInfo,
      clearUserInfo,
      fetchUserInfo,
      setUserInfo,
      setUserAvatar,
    }
  },
  {
    persist: true,
  },
)


import { setToken, removeToken } from "@/utils/auth"

export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref({
      name: null,
      token: null,
      avatar: null,
      userID: null,
      repairCount: null,
      day: null,
      isPro: null,
    })
    const isLogin = computed(() => !!user.value.token)
    const setAvatar = (avatar) => {
      console.log(avatar)
      user.value.avatar = import.meta.env.VITE_SERVER + "/" + avatar
    }
    const setName = (name) => {
      user.value.name = name
    }
    const setRepairCount = (repairCount) => {
      user.value.repairCount = repairCount
    }
    const login = (data) => {
      setAvatar(data.avatar)
      setName(data.name)
      user.value.userId = data.userId
      user.value.repairCount = data.repairCount
      user.value.day = data.day
      user.value.isPro = data.isPro
    }
    const onSetToken = (data) => {
      user.value.token = data.token
      setToken(data.token)
    }
    const logout = () => {
      user.value.name = null
      user.value.token = null
      removeToken()
    }
    return { user, isLogin, login, logout, onSetToken, setRepairCount }
  },
  {
    persist: true, //持久化
  }
)
