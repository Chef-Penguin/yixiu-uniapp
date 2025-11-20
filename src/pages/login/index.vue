<template>
  <view items-center justify-center class="h100%">
    <component
      :is="components[currentComp]"
      ref="currentComponentRef"
      :model-value="currentComp === 'PhoneInput' ? phone : vcode"
      :agree="agree"
      :area="area_code"
      :phone="phone"
      @update:model-value="onUpdateModel"
      @update:agree="(v) => (agree = v)"
      @send="sendCode"
      @verify="onVerify"
      @back="() => (currentComp = 'PhoneInput')"
      @open-area-code-select="openAreaCodeSelect"
      @resend="onResend"
    />
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  getProjectCodeApi,
  getUserInfo,
  getVcodeApi,
  loginApi,
} from '@/api/user.js'
import { useUserStore } from '@/stores/user.js'
import PopupService from '@/utils/PopupService.js'
import RequestLoading from '@/utils/RequestLoading'
import PhoneInput from './components/PhoneInput.vue'
import VcodeInput from './components/VcodeInput.vue'

const userStore = useUserStore()
const components = { PhoneInput, VcodeInput }
const currentComp = ref('PhoneInput')
const phone = ref('')
const agree = ref(false)
const vcode = ref(['', '', '', '', '', ''])
const area_code = ref('86')
const currentComponentRef = ref(null)

function onUpdateModel(val) {
  if (currentComp.value === 'PhoneInput')
    phone.value = val
  else vcode.value = Array.isArray(val) ? val : [...val]
}
async function getCode() {
  try {
    const res = await getProjectCodeApi({ code: '' })
    console.log(res)
  }
  catch (error) {}
}
function openAreaCodeSelect() {
  PopupService.open({
    component: 'AreaCodeSelect',
    style: { padding: '20px 0' },
    props: {
      onHandleCodeItem: (item) => {
        area_code.value = String(item.code).replace(/^\+/, '')
      },
    },
  })
}
async function sendCode() {
  if (!agree.value) {
    const el = document.querySelector('.agreement')
    if (!el)
      return
    el.classList.remove('shake')
    void el.offsetWidth
    el.classList.add('shake')
    setTimeout(() => el.classList.remove('shake'), 600)
    return
  }
  const pattern = /^1[3-9]\d{9}$/
  const isPhone = pattern.test(phone.value)
  if (!isPhone) {
    uni.showToast('请输入正确的手机号')
    return
  }
  await RequestLoading(getVcodeApi, {
    phone: phone.value,
    areCode: area_code.value,
  })
  // switch to vcode input
  currentComp.value = 'VcodeInput'
}
async function onToken(token) {
  const { data } = await RequestLoading(getUserInfo, { token })
  let routeQuery = null
  if (data?.register) {
    routeQuery = { path: '/userEdit', query: { first: true } }
  }
  else {
    routeQuery = { path: '/' }
  }
  userStore.login({
    name: data.name,
    avatar: data.picture,
    userId: data.id,
    repairCount: data.repairCount,
    day: data.day,
    isPro: data.isPro,
  })
  uni.navigateTo(routeQuery)
}

async function onVerify() {
  // assemble vcode
  const code = vcode.value.join('')
  if (code.length !== 6) {
    uni.showToast('请输入6位验证码')
    return
  }
  try {
    const loginRes = await RequestLoading(loginApi, {
      phone: phone.value,
      vcode: code,
    })
    // 请求成功，res.data 应包含 token 按 request.js 响应结构 res.data
    const tokenStr = loginRes.token
    if (!tokenStr) {
      uni.showToast('登录失败：未返回 token')
      return
    }
    userStore.onSetToken({ token: tokenStr })
    onToken(tokenStr)
  }
  catch (e) {
    // 错误已在 request 拦截/RequestLoading 处理过，这里可额外处理
    console.error(e)
  }
}

async function onResend() {
  try {
    await RequestLoading(getVcodeApi, {
      phone: phone.value,
      areCode: area_code.value,
    })
    // 重置倒计时
    if (currentComponentRef.value && currentComponentRef.value.resetCountdown) {
      currentComponentRef.value.resetCountdown()
    }
    uni.showToast('验证码已重新发送')
  }
  catch (error) {
    // 错误已在 RequestLoading 中处理
  }
}

onMounted(async () => {
  // await getCode()
})

// defineExpose({ PhoneInput, VcodeInput })
</script>

<style lang="scss" scoped></style>
