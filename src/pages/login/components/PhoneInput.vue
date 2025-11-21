<template>
  <view class="phone-login">
    <view class="logo" />
    <text class="title">一修师傅，你的修车助手</text>
    <text class="subtitle">未注册手机验证登陆后自动登录</text>
    <view class="phone_input">
      <view class="area" @tap="onHandleAreaCode">
        +{{ area }}
      </view>
      <input
        v-model="localPhone"
        type="number"
        placeholder="请输入手机号"
        maxlength="11"
      >
    </view>
    <view
      class="send_btn"
      :class="{ 'btn-active': isPhoneValid }"
      @tap="onSend"
    >
      发送验证码
    </view>
    <view class="agreement">
      <checkbox
        :checked="localAgree"
        class="agreement-checkbox"
        @tap="localAgree = !localAgree"
      />
      <text class="agreement-label">已阅读并同意</text>
      <text class="agreement-link" @tap="onHandleShowAgreement(0)">《用户协议》</text>
      <text class="agreement-link" @tap="onHandleShowAgreement(1)">《数据隐私安全声明》</text>
    </view>
  </view>
</template>

<script setup>
import { computed, toRefs } from 'vue'
import PopupService from '@/utils/PopupService'

defineOptions({ name: 'PhoneInput' })

const props = defineProps({
  modelValue: { type: String, default: '' },
  agree: { type: Boolean, default: false },
  area: { type: String, default: '86' },
})

const emit = defineEmits([
  'update:modelValue',
  'update:agree',
  'send',
  'openAreaCodeSelect',
])

const { modelValue, agree: propsAgree } = toRefs(props)

const localPhone = computed({
  get: () => modelValue.value,
  set: v => emit('update:modelValue', v),
})

const localAgree = computed({
  get: () => propsAgree.value,
  set: v => emit('update:agree', v),
})

function onSend() {
  emit('send')
}

function onHandleAreaCode() {
  emit('openAreaCodeSelect')
}

// 判断手机号是否完整（11位数字，以1开头）
const isPhoneValid = computed(() => {
  const pattern = /^1[3-9]\d{9}$/
  return pattern.test(localPhone.value)
})

function onHandleShowAgreement(type) {
  // type 0: 用户协议, 1: 数据隐私安全声明
  PopupService.open({
    component: type === 0 ? 'Protocol' : 'Conditions',
    style: { padding: '10px 10px', height: '80%' },
  }).catch(err => {
    console.error('打开弹窗失败:', err)
  })
}
</script>

<style lang="scss" scoped>
.phone_input {
  display: flex;
  width: 310px;
  border: 1px solid #000;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 20px;
  align-items: center;
  min-height: 50px;
  height: 50px;
  z-index: 99;
  margin-top: 20px;

  .area {
    padding: 10px 12px;
    background: transparent;
    border-right: 1px solid #000;
    flex-shrink: 0;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .separation {
    width: 1px;
    background: #000;
    height: 70%;
  }

  input {
    border: none;
    outline: none;
    flex: 1;
    padding: 10px;
    font-size: 14px;
    height: 100%;
    min-height: 30px;
    box-sizing: border-box;
  }
}

.phone-login {
  display: flex;
  flex-direction: column;
  padding-top: 50px;
  align-items: center;
  height: 100%;
  background-color: #f8f7fc;
  padding-bottom: env(safe-area-inset-bottom, 20px);
  min-height: 100vh;
}

.logo {
  width: 300px;
  height: 300px;
  // background: url('/src/static/images/login2.png');
  background-size: cover;
}

.title {
  font-size: 18px;
  margin-top: 10px;
}

.subtitle {
  font-size: 12px;
  margin-bottom: 25px;
  margin-top: 10px;
}

.send_btn {
  width: 310px;
  border-radius: 40px;
  background: #a2a2a2 !important;
  color: #fff;
  padding: 10px 10px;
  text-align: center;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;
}

.send_btn.btn-active {
  background: #f46205 !important;
}

.agreement {
  font-size: 12px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 20px;
}

.agreement-checkbox {
  transform: scale(0.7);
  margin-right: -4px;
}

.agreement-label {
  color: #000;
}

.agreement-link {
  color: #f46205;
}

@keyframes shakeX {
  0% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-8px);
  }

  40% {
    transform: translateX(8px);
  }

  60% {
    transform: translateX(-6px);
  }

  80% {
    transform: translateX(6px);
  }

  100% {
    transform: translateX(0);
  }
}

.agreement.shake {
  animation: shakeX 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

.btn-disabled {
  opacity: 0.6;
}
</style>
