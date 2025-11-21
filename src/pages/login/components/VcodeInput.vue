<template>
  <view class="vcode-root">
    <view class="back-btn top" @tap="$emit('back')">
      <text class="back-icon">‹</text>
    </view>
    <view class="vcode-area">
      <text class="desc title">请输入验证码</text>
      <text class="desc info">验证码已发送至 +{{ area }} {{ phone }}</text>
      <view class="vcode-box" :class="{ 'vcode-complete': isVcodeComplete }">
        <input
          v-for="(v, i) in values.length"
          :key="i"
          maxlength="1"
          :value="values[i]"
          :focus="focusIndex === i"
          type="number"
          class="vcode-input"
          @input="onInput($event, i)"
          @blur="onBlur(i)"
        >
      </view>
      <view class="actions">
        <view
          class="verify-btn"
          :class="{ 'vcode-complete': isVcodeComplete }"
          @tap="$emit('verify')"
        >
          验证
        </view>
      </view>
      <view class="resend-area">
        <text v-if="countdown > 0" class="countdown-text">{{ countdown }}s后可重新获取</text>
        <view
          v-else
          class="resend-btn"
          @tap="$emit('resend')"
        >
          重新获取验证码
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

defineOptions({ name: 'VcodeInput' })

const props = defineProps({
  modelValue: { type: Array, default: () => ['', '', '', '', '', ''] },
  phone: { type: String, default: '' },
  area: { type: [String, Number], default: '86' },
})
const emit = defineEmits(['update:modelValue', 'verify', 'back', 'resend'])

const values = ref([...props.modelValue])
const focusIndex = ref(-1)
const countdown = ref(60)
let countdownTimer = null

watch(
  () => props.modelValue,
  (v) => {
    values.value = [...v]
  },
)

onLoad(() => {
  // 初始聚焦到第一个输入框
  setTimeout(() => {
    focusIndex.value = 0
  }, 300)
  startCountdown()
})

function onInput(e, i) {
  const val = e.detail.value.slice(-1)
  values.value[i] = val
  emit('update:modelValue', [...values.value])

  // 自动跳转到下一个输入框
  if (val && i < values.value.length - 1) {
    focusIndex.value = -1 // 先取消焦点
    setTimeout(() => {
      focusIndex.value = i + 1 // 聚焦下一个
    }, 50)
  }
  else if (val && i === values.value.length - 1) {
    // 最后一个输入框，取消焦点
    focusIndex.value = -1
  }
}

function onBlur(i) {
  // 失去焦点时，如果当前输入框为空且不是最后一个，不做处理
  // 这样可以让用户手动点击其他输入框
}

// 启动倒计时
function startCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    }
    else {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 重置倒计时
function resetCountdown() {
  countdown.value = 60
  startCountdown()
  // 重置时也聚焦到第一个输入框
  setTimeout(() => {
    focusIndex.value = 0
  }, 300)
}

// 暴露重置倒计时方法给父组件
defineExpose({
  resetCountdown,
})

// 判断验证码是否完整（6位）
const isVcodeComplete = computed(() => {
  return (
    values.value.every(v => v && v.trim() !== '') && values.value.length === 6
  )
})
</script>

<style lang="scss" scoped>
.vcode-root {
  position: relative;
  height: 100%;
  width: 100%;
}

.vcode-area {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.desc {
  color: #333;
  font-size: 16px;
}

.desc.title {
  font-weight: 600;
  font-size: 18px;
}

.desc.info {
  color: #666;
  font-size: 14px;
  margin-top: 6px;
}

.back-btn {
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.back-icon {
  font-size: 48px;
  color: #333;
  line-height: 30px;
  font-weight: 300;
}

.vcode-box {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.vcode-input {
  width: 40px;
  height: 60px;
  text-align: center;
  font-size: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
}

.vcode-box .vcode-input:focus {
  border-color: #f46205;
}

.vcode-box.vcode-complete .vcode-input {
  color: #f46205;
  border-color: #f46205;
}

.actions {
  display: flex;
  width: 100%;
  padding: 0 20px;
  margin-top: 20px;
}

.verify-btn {
  width: 100%;
  height: 44px;
  border-radius: 40px;
  font-size: 16px;
  background: #a2a2a2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.verify-btn.vcode-complete {
  background: #f46205 !important;
}

.resend-area {
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
}

.countdown-text {
  color: #666;
  font-size: 14px;
}

.resend-btn {
  background: transparent;
  border: 1px solid #f46205;
  color: #f46205;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
}
</style>
