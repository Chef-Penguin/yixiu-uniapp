<template>
  <div class="vcode-root">
    <button class="back-btn top" @click="$emit('back')" aria-label="返回">
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="#333"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <div class="vcode-area">
      <div class="desc title">请输入验证码</div>
      <div class="desc info">验证码已发送至 +{{ area }} {{ phone }}</div>
      <div class="vcode-box" :class="{ 'vcode-complete': isVcodeComplete }">
        <input
          v-for="(v, i) in values.length"
          :key="i"
          :ref="(el) => setRef(el, i)"
          maxlength="1"
          :value="values[i]"
          @input="onInput($event, i)"
          @keydown="onKeydown($event, i)"
          @focus="onFocus($event, i)"
          @mousedown="onMouseDown($event, i)"
          inputmode="numeric"
        />
      </div>
      <div class="actions">
        <van-button
          type="primary"
          :class="{ 'vcode-complete': isVcodeComplete }"
          @click="$emit('verify')"
        >
          验证
        </van-button>
      </div>
      <div class="resend-area">
        <span v-if="countdown > 0" class="countdown-text">{{ countdown }}s后可重新获取</span>
        <van-button
          v-else
          type="default"
          class="resend-btn"
          @click="$emit('resend')"
        >
          重新获取验证码
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue"
const props = defineProps({
  modelValue: { type: Array, default: () => ["", "", "", "", "", ""] },
  phone: { type: String, default: "" },
  area: { type: [String, Number], default: "86" },
})
const emit = defineEmits(["update:modelValue", "verify", "back", "resend"])

const values = ref([...props.modelValue])
const inputs = ref([])
const countdown = ref(60)
let countdownTimer = null

watch(
  () => props.modelValue,
  (v) => {
    values.value = [...v]
  }
)

const focusFirstEmpty = () => {
  const idx = values.value.findIndex((x) => !x)
  const i = idx === -1 ? values.value.length - 1 : idx
  const el = inputs.value[i]
  if (el && typeof el.focus === "function") el.focus()
}

onMounted(() => {
  // small timeout to ensure parents mounted
  setTimeout(() => focusFirstEmpty(), 0)
  // 启动倒计时
  startCountdown()
})

const onInput = (e, i) => {
  const val = e.target.value.slice(-1)
  values.value[i] = val
  emit("update:modelValue", [...values.value])
  if (val && i < inputs.value.length - 1) inputs.value[i + 1].focus()
}

const onKeydown = (e, i) => {
  if (e.key === "Backspace") {
    if (values.value[i]) {
      values.value[i] = ""
      emit("update:modelValue", [...values.value])
    } else if (i > 0) {
      inputs.value[i - 1].focus()
      values.value[i - 1] = ""
      emit("update:modelValue", [...values.value])
    }
    e.preventDefault()
  }
}

const onFocus = (e, i) => {
  // always focus first empty
  const idx = values.value.findIndex((x) => !x)
  const target = idx === -1 ? values.value.length - 1 : idx
  if (i !== target) {
    inputs.value[target].focus()
  }
}

const onMouseDown = (e, i) => {
  // prevent focusing filled boxes
  if (values.value[i]) {
    e.preventDefault()
    focusFirstEmpty()
  }
}

// collect refs by index
const setRef = (el, i) => {
  inputs.value[i] = el
}

// 启动倒计时
const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 重置倒计时
const resetCountdown = () => {
  countdown.value = 60
  startCountdown()
}

// 暴露重置倒计时方法给父组件
defineExpose({
  resetCountdown
})

// 判断验证码是否完整（6位）
const isVcodeComplete = computed(() => {
  return (
    values.value.every((v) => v && v.trim() !== "") && values.value.length === 6
  )
})
</script>

<style scoped>
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
  border: none;
  background: transparent;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.back-btn.top {
  position: absolute;
  left: 12px;
  top: 12px;
}
.back-btn svg {
  display: block;
}
.vcode-box {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}
.vcode-box input {
  width: 40px;
  height: 60px;
  text-align: center;
  font-size: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}
.vcode-box input:focus {
  border-color: #f46205;
  box-shadow: 0 0 0 2px rgba(244, 98, 5, 0.08);
}

.vcode-box.vcode-complete input {
  color: #f46205;
}
.actions {
  display: flex;
  gap: 10px;
  width: 100%;
  padding: 0 20px;
  margin-top: 20px;
}

.actions :deep(.van-button) {
  width: 100%;
  height: 44px;
  border-radius: 40px;
  font-size: 16px;
  transition: background-color 0.3s ease;
  background: #a2a2a2;
  border: none;
}

.actions :deep(.van-button.vcode-complete) {
  background-color: #f46205 !important; /* 主题橘黄色 */
  border-color: #f46205 !important;
  color: #fff !important; /* 白色文字 */
}

.resend-area {
  margin-top: 20px;
  text-align: center;
}

.countdown-text {
  color: #666;
  font-size: 14px;
}

.resend-btn {
  background: transparent !important;
  border: 1px solid #f46205 !important;
  color: #f46205 !important;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
}

.resend-btn :deep(.van-button__text) {
  color: #f46205;
}
</style>
